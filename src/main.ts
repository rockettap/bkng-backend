import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
// import { Booking } from './booking/booking.entity';
// import { CalendarOrchestrator } from './calendar/application/calendar.orchestrator';
// import { TimeRange } from './common/value-objects/time-range.vo';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  // const expressApp = app.getHttpAdapter().getInstance();

  // expressApp.get('/', (req, res) => {
  //   const html = `
  //     <!DOCTYPE html>
  //     <html lang="en">
  //     <head>
  //       <meta charset="UTF-8" />
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  //       <title>bkng Landing</title>
  //       <!-- Google tag (gtag.js) -->
  //       <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZPX5VZYVGB"></script>
  //       <script>
  //         window.dataLayer = window.dataLayer || [];
  //         function gtag(){dataLayer.push(arguments);}
  //         gtag('js', new Date());

  //         gtag('config', 'G-ZPX5VZYVGB');
  //       </script>
  //     </head>
  //     <body>
  //       <h1>📘 Welcome to bkng</h1>
  //       <p>This is a basic landing page with Google Analytics tracking.</p>
  //     </body>
  //     </html>
  //   `;
  //   res.type('html').send(html);
  // });

  // const calendarOrchestrator = app.get(CalendarOrchestrator);

  // await calendarOrchestrator.createEvents(
  //   new Booking(
  //     0,
  //     0,
  //     new TimeRange(
  //       new Date('2025-08-29T17:54:18Z'),
  //       new Date('2025-08-29T17:59:18Z'),
  //     ),
  //     1,
  //   ),
  // );

  const config = new DocumentBuilder()
    .setTitle('bkng')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
