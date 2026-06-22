import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('TimeNet Biométrico API')
    .setDescription(
      'API de integração com o sistema biométrico ZKTeco TimeNet.\n\n' +
      '**Banco de dados:** SQLite TimeNet.db\n' +
      '**Terminal:** BIOMETRICO RH (K14/ID) — 10.182.13.13\n' +
      '**Empresa:** Tribunal da Comarca de Luanda\n\n' +
      '**Módulos disponíveis:**\n' +
      '- Funcionários (245 registos)\n' +
      '- Departamentos (16 departamentos)\n' +
      '- Registos de Ponto/Punches (66.084 registos)\n' +
      '- Frequência Diária — Day Summary (1.007.070 registos)\n' +
      '- Detalhes de Entrada/Saída (100.944 registos)\n' +
      '- Terminais Biométricos\n' +
      '- Turnos e Horários\n' +
      '- Relatórios e Dashboard',
    )
    .setVersion('1.0')
    .addTag('Funcionários')
    .addTag('Departamentos')
    .addTag('Registos de Ponto (Punches)')
    .addTag('Frequência / Assiduidade')
    .addTag('Terminais Biométricos')
    .addTag('Turnos e Horários')
    .addTag('Relatórios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\n🚀 TimeNet API a correr em: http://localhost:${port}`);
  console.log(`📚 Swagger Docs:             http://localhost:${port}/docs\n`);
}
bootstrap();
