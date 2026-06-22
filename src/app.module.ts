import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { PunchesModule } from './punches/punches.module';
import { AttendanceModule } from './attendance/attendance.module';
import { TerminalsModule } from './terminals/terminals.module';
import { ShiftsModule } from './shifts/shifts.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    DatabaseModule,
    EmployeesModule,
    DepartmentsModule,
    PunchesModule,
    AttendanceModule,
    TerminalsModule,
    ShiftsModule,
    ReportsModule,
  ],
})
export class AppModule {}
