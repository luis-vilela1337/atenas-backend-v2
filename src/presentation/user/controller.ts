import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { FindAllUserV2Application } from '@application/user/find-all.application';
import {
  CreateUserResponseV2Dto,
  CreateUserV2InputDto,
} from './dto/create-user.dto';
import { CreateUserV2Application } from '@application/user/create-user.application';
import {
  UpdateUserV2InputDto,
  UpdateUserV2ResponseDto,
} from './dto/update-user.dto';
import { UpdateUserV2Application } from '@application/user/update-user.application';
import { DeleteUserV2Application } from '@application/user/delete-user.application';
import { DeleteUserResponseDto } from './dto/delete-user.dto';
import { GeneratePresignedUrV2Application } from '@application/storage/presigned-url.application';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '@presentation/auth/guards/admin.guard';
import { FindUserByIdV2Application } from '@application/user/find-user-by-id.application';

@Controller('v1/users')
@ApiTags('users')
export class UsersControllerV2 {
  constructor(
    private readonly findAllUser: FindAllUserV2Application,
    private readonly findUserById: FindUserByIdV2Application,
    private readonly createUserApplication: CreateUserV2Application,
    private readonly updateUserApplication: UpdateUserV2Application,
    private readonly deleteUserApplication: DeleteUserV2Application,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'Listar todos os usuários (paginado)' })
  @ApiQuery({ type: ListUsersQueryDto })
  @ApiResponse({ status: 200, type: PaginatedUsersDto })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)  
  async listUsers(
    @Query() query: ListUsersQueryDto,
  ): Promise<PaginatedUsersDto> {
    return await this.findAllUser.execute(query);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Obter um usuário pelo ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: Object })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)  
  async listUserById(@Param('id') id: string) {
    return await this.findUserById.execute(id);
  }

  @Post('/')
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiBody({ type: CreateUserV2InputDto })
  @ApiResponse({ status: 201, type: CreateUserResponseV2Dto })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminGuard)  
  async createUser(
    @Body() createUserDto: CreateUserV2InputDto,
  ): Promise<CreateUserResponseV2Dto> {
    return await this.createUserApplication.execute({
      ...createUserDto,
      status: 'active',
    });
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Atualizar um usuário existente' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateUserV2InputDto })
  @ApiResponse({ status: 200, type: UpdateUserV2ResponseDto })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)  
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserV2InputDto,
  ): Promise<UpdateUserV2ResponseDto> {
    return await this.updateUserApplication.execute(
      { ...updateUserDto, status: 'active' },
      id,
    );
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Remover um usuário' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: DeleteUserResponseDto })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)  
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeleteUserResponseDto> {
    return await this.deleteUserApplication.execute(id);
  }
}
