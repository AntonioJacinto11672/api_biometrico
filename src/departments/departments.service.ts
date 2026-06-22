import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly db: DatabaseService) {}

  findAll() {
    return this.db.query(
      `SELECT d.*, c.cmp_name, COUNT(e.id) as total_employees
       FROM hr_department d
       LEFT JOIN hr_company c ON c.id = d.company_id
       LEFT JOIN hr_employee e ON e.department_id = d.id AND e.emp_active = 1
       GROUP BY d.id
       ORDER BY d.dept_name`,
    );
  }

  findOne(id: number) {
    return this.db.queryOne(
      `SELECT d.*, c.cmp_name FROM hr_department d
       LEFT JOIN hr_company c ON c.id = d.company_id
       WHERE d.id = ?`,
      [id],
    );
  }

  findEmployees(id: number) {
    return this.db.query(
      `SELECT e.id, e.emp_pin, e.emp_firstname, e.emp_lastname,
              e.emp_title, e.emp_active, e.emp_hiredate, p.posi_name
       FROM hr_employee e
       LEFT JOIN hr_position p ON p.id = e.position_id
       WHERE e.department_id = ?
       ORDER BY e.emp_firstname`,
      [id],
    );
  }
}
