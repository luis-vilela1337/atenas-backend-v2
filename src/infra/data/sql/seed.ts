import { DataSource } from 'typeorm';
import { dataSourceOptions } from './database.config';
import * as bcrypt from 'bcryptjs';

/**
 * Script de seed para popular o banco com dados iniciais
 * 
 * Cria:
 * - 1 Instituição de exemplo
 * - 1 Admin user
 * - 1 Client user (formando)
 * - 3 Produtos exemplo (ALBUM, GENERIC, DIGITAL_FILES)
 * - 2 Eventos da instituição
 * - Produtos vinculados à instituição
 * 
 * Como executar:
 * pnpm run seed
 */

async function seed() {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    const dataSource = new DataSource(dataSourceOptions);
    await dataSource.initialize();

    try {
        // ==========================================
        // 1. CRIAR INSTITUIÇÃO
        // ==========================================
        console.log('📚 Criando instituição...');

        const institutionRepo = dataSource.getRepository('Institution');

        let institution = await institutionRepo.findOne({
            where: { contractNumber: 'INST-001' },
        });

        if (!institution) {
            institution = await institutionRepo.save({
                contractNumber: 'INST-001',
                name: 'Universidade Federal de Exemplo',
                observations: 'Instituição criada automaticamente para testes e desenvolvimento',
            });
            console.log(`✅ Instituição criada: ${institution.name} (${institution.contractNumber})`);
        } else {
            console.log(`⏭️  Instituição já existe: ${institution.name}`);
        }

        // ==========================================
        // 2. CRIAR EVENTOS DA INSTITUIÇÃO
        // ==========================================
        console.log('\n🎉 Criando eventos da instituição...');

        const eventsRepo = dataSource.getRepository('InstitutionEvent');

        const eventNames = ['Formatura', 'Baile de Gala'];
        const createdEvents = [];

        for (const eventName of eventNames) {
            let event = await eventsRepo.findOne({
                where: {
                    name: eventName,
                    institution: { id: institution.id }
                },
                relations: ['institution']
            });

            if (!event) {
                event = await eventsRepo.save({
                    name: eventName,
                    institution: institution,
                });
                console.log(`✅ Evento criado: ${event.name}`);
                createdEvents.push(event);
            } else {
                console.log(`⏭️  Evento já existe: ${eventName}`);
                createdEvents.push(event);
            }
        }

        // ==========================================
        // 3. CRIAR USUÁRIOS
        // ==========================================
        console.log('\n👥 Criando usuários...');

        const userRepo = dataSource.getRepository('User');
        const passwordHash = await bcrypt.hash('senha123', 10);

        // Admin
        let admin = await userRepo.findOne({
            where: { email: 'admin@atenas.com' },
        });

        if (!admin) {
            admin = await userRepo.save({
                name: 'Admin Atenas',
                identifier: '001',
                email: 'admin@atenas.com',
                phone: '11999999999',
                passwordHash: passwordHash,
                role: 'admin',
                status: 'active',
                institution: institution,
                creditValue: '0.00',
                creditReserved: '0.00',
            });
            console.log(`✅ Admin criado: ${admin.email} / senha: senha123`);
        } else {
            console.log(`⏭️  Admin já existe: ${admin.email}`);
        }

        // Cliente (Formando)
        let client = await userRepo.findOne({
            where: { email: 'cliente@exemplo.com' },
        });

        if (!client) {
            client = await userRepo.save({
                name: 'João Silva',
                identifier: '002',
                email: 'cliente@exemplo.com',
                phone: '11988888888',
                passwordHash: passwordHash,
                role: 'client',
                status: 'active',
                institution: institution,
                creditValue: '500.00', // R$ 500 de crédito inicial
                creditReserved: '0.00',
                cpf: '12345678901',
                zipCode: '01310-100',
                street: 'Avenida Paulista',
                number: '1000',
                neighborhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
            });
            console.log(`✅ Cliente criado: ${client.email} / senha: senha123 (R$ 500 crédito)`);
        } else {
            console.log(`⏭️  Cliente já existe: ${client.email}`);
        }

        // ==========================================
        // 4. CRIAR PRODUTOS
        // ==========================================
        console.log('\n📦 Criando produtos...');

        const productRepo = dataSource.getRepository('Product');

        const products = [
            {
                name: 'Álbum de Formatura Premium',
                flag: 'ALBUM',
                description: 'Álbum de luxo com acabamento premium, 30 a 50 fotos',
                photos: ['https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Album'],
                video: [],
            },
            {
                name: 'Fotos Avulsas',
                flag: 'GENERIC',
                description: 'Fotos impressas individuais dos eventos',
                photos: ['https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Fotos'],
                video: [],
            },
            {
                name: 'Pacote Digital Completo',
                flag: 'DIGITAL_FILES',
                description: 'Todas as fotos em alta resolução formato digital',
                photos: ['https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Digital'],
                video: [],
            },
        ];

        const createdProducts = [];

        for (const productData of products) {
            let product = await productRepo.findOne({
                where: { name: productData.name },
            });

            if (!product) {
                product = await productRepo.save(productData);
                console.log(`✅ Produto criado: ${product.name} (${product.flag})`);
                createdProducts.push(product);
            } else {
                console.log(`⏭️  Produto já existe: ${productData.name}`);
                createdProducts.push(product);
            }
        }

        // ==========================================
        // 5. VINCULAR PRODUTOS À INSTITUIÇÃO
        // ==========================================
        console.log('\n🔗 Vinculando produtos à instituição...');

        const institutionProductRepo = dataSource.getRepository('InstitutionProduct');

        // Configurações específicas por tipo de produto
        const productConfigs = [
            // ALBUM
            {
                product: createdProducts[0],
                flag: 'ALBUM',
                details: {
                    minPhoto: 30,
                    maxPhoto: 50,
                    valorEncadernacao: 150.00, // R$ 150 encadernação
                    valorFoto: 5.00, // R$ 5 por foto
                },
            },
            // GENERIC
            {
                product: createdProducts[1],
                flag: 'GENERIC',
                details: {
                    isAvailableUnit: true,
                    events: [
                        {
                            id: createdEvents[0].id,
                            name: 'Formatura',
                            minPhotos: 1,
                            valorPhoto: 10.00, // R$ 10 por foto
                            valorPack: 200.00, // R$ 200 pacote completo do evento
                        },
                        {
                            id: createdEvents[1].id,
                            name: 'Baile de Gala',
                            minPhotos: 1,
                            valorPhoto: 8.00, // R$ 8 por foto
                            valorPack: 150.00, // R$ 150 pacote completo do evento
                        },
                    ],
                },
            },
            // DIGITAL_FILES
            {
                product: createdProducts[2],
                flag: 'DIGITAL_FILES',
                details: {
                    isAvailableUnit: true,
                    valorPackTotal: 300.00, // R$ 300 pack completo de tudo
                    events: [
                        {
                            id: createdEvents[0].id,
                            name: 'Formatura',
                            valorPhoto: 3.00, // R$ 3 por foto digital
                            valorPack: 100.00, // R$ 100 todas digitais do evento
                        },
                        {
                            id: createdEvents[1].id,
                            name: 'Baile de Gala',
                            valorPhoto: 3.00,
                            valorPack: 80.00,
                        },
                    ],
                },
            },
        ];

        for (const config of productConfigs) {
            const existing = await institutionProductRepo.findOne({
                where: {
                    product: { id: config.product.id },
                    institution: { id: institution.id },
                },
                relations: ['product', 'institution'],
            });

            if (!existing) {
                await institutionProductRepo.save({
                    product: config.product,
                    institution: institution,
                    flag: config.flag,
                    details: config.details,
                });
                console.log(`✅ Produto vinculado: ${config.product.name}`);
            } else {
                console.log(`⏭️  Vínculo já existe: ${config.product.name}`);
            }
        }

        // ==========================================
        // RESUMO
        // ==========================================
        console.log('\n' + '='.repeat(50));
        console.log('✅ SEED CONCLUÍDO COM SUCESSO!');
        console.log('='.repeat(50));
        console.log('\n📋 DADOS CRIADOS:\n');
        console.log(`🏢 Instituição: ${institution.name}`);
        console.log(`   Número do Contrato: ${institution.contractNumber}\n`);
        console.log('👤 ADMIN:');
        console.log(`   Email: admin@atenas.com`);
        console.log(`   Senha: senha123`);
        console.log(`   Role: admin\n`);
        console.log('👤 CLIENTE (Formando):');
        console.log(`   Email: cliente@exemplo.com`);
        console.log(`   Senha: senha123`);
        console.log(`   Role: client`);
        console.log(`   Crédito: R$ 500,00\n`);
        console.log(`🎉 Eventos: ${eventNames.join(', ')}`);
        console.log(`📦 Produtos: ${createdProducts.length} produtos criados`);
        console.log('\n' + '='.repeat(50));
        console.log('🚀 Você já pode fazer login na aplicação!');
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('❌ Erro ao executar seed:', error);
        throw error;
    } finally {
        await dataSource.destroy();
    }
}

// Executar seed
seed()
    .then(() => {
        console.log('✅ Script finalizado com sucesso');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });
