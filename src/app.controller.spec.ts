import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestEntity } from './test.entity';

describe('AppController', () => {
  jest.setTimeout(60000);

  let databaseContainer: StartedMySqlContainer;
  let module: TestingModule;
  let controller: AppController;

  beforeAll(async () => {
    databaseContainer = await new MySqlContainer().start();
    module = await Test.createTestingModule({
      controllers: [AppController],
      imports: [
        TypeOrmModule.forRoot({
          host: databaseContainer.getHost(),
          port: databaseContainer.getPort(),
          database: databaseContainer.getDatabase(),
          username: databaseContainer.getUsername(),
          password: databaseContainer.getUserPassword(),
          entities: ['/**/*.entity.ts'],
          synchronize: true,
          type: 'mysql',
        }),
        TypeOrmModule.forFeature([TestEntity]),
      ],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  afterAll(async () => {
    module.get('TypeOrmModuleOptions').database.close();
    databaseContainer.stop();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(controller.getHello()).toBe('Hello World!');
    });
  });
});
