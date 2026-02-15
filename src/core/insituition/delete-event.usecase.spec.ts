import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteEventUseCase } from './delete-event.usecase';
import { InstitutionEventSQLRepository } from '@infrastructure/data/sql/repositories/institution-event.repository';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';

describe('DeleteEventUseCase', () => {
  let useCase: DeleteEventUseCase;
  let eventRepo: jest.Mocked<InstitutionEventSQLRepository>;
  let productRepo: jest.Mocked<InstitutionProductSQLRepository>;

  beforeEach(async () => {
    const mockEventRepo = {
      findById: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockProductRepo = {
      removeEventFromDetails: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteEventUseCase,
        { provide: InstitutionEventSQLRepository, useValue: mockEventRepo },
        {
          provide: InstitutionProductSQLRepository,
          useValue: mockProductRepo,
        },
      ],
    }).compile();

    useCase = module.get<DeleteEventUseCase>(DeleteEventUseCase);
    eventRepo = module.get(InstitutionEventSQLRepository);
    productRepo = module.get(InstitutionProductSQLRepository);
  });

  it('GIVEN valid event ID WHEN deleting THEN should cleanup details and soft delete', async () => {
    const eventId = 'event-x-uuid';
    eventRepo.findById.mockResolvedValue({
      id: eventId,
      name: 'Evento X',
    } as any);
    eventRepo.softDelete.mockResolvedValue(undefined);
    productRepo.removeEventFromDetails.mockResolvedValue(undefined);

    await useCase.execute(eventId);

    expect(eventRepo.findById).toHaveBeenCalledWith(eventId);
    expect(productRepo.removeEventFromDetails).toHaveBeenCalledWith(eventId);
    expect(eventRepo.softDelete).toHaveBeenCalledWith(eventId);
  });

  it('GIVEN valid event ID WHEN deleting THEN should cleanup details BEFORE soft delete', async () => {
    const callOrder: string[] = [];
    const eventId = 'event-x-uuid';

    eventRepo.findById.mockResolvedValue({
      id: eventId,
      name: 'Evento X',
    } as any);
    productRepo.removeEventFromDetails.mockImplementation(async () => {
      callOrder.push('removeEventFromDetails');
    });
    eventRepo.softDelete.mockImplementation(async () => {
      callOrder.push('softDelete');
    });

    await useCase.execute(eventId);

    expect(callOrder).toEqual(['removeEventFromDetails', 'softDelete']);
  });

  it('GIVEN non-existent event ID WHEN deleting THEN should throw NotFoundException', async () => {
    const eventId = 'non-existent-uuid';
    eventRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(eventId)).rejects.toThrow(NotFoundException);
    expect(productRepo.removeEventFromDetails).not.toHaveBeenCalled();
    expect(eventRepo.softDelete).not.toHaveBeenCalled();
  });

  it('GIVEN cleanup error WHEN deleting THEN should propagate error and NOT soft delete', async () => {
    const eventId = 'event-x-uuid';
    eventRepo.findById.mockResolvedValue({
      id: eventId,
      name: 'Evento X',
    } as any);
    productRepo.removeEventFromDetails.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute(eventId)).rejects.toThrow('DB error');
    expect(eventRepo.softDelete).not.toHaveBeenCalled();
  });
});
