import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ReservationsModule } from './../src/reservations.module';

describe('ReservationsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ReservationsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-call,
       @typescript-eslint/no-unsafe-member-access,
       @typescript-eslint/no-unsafe-return */
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
    /* eslint-enable @typescript-eslint/no-unsafe-call,
       @typescript-eslint/no-unsafe-member-access,
       @typescript-eslint/no-unsafe-return */
  });
});
