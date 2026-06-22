import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly db: DatabaseService) {}

  findAll(params: {
    active?: number;
    department_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = [];
    const args: any[] = [];

    if (params.active !== undefined) {
      conditions.push('e.emp_active = ?');
      args.push(params.active);
    }
    if (params.department_id) {
      conditions.push('e.department_id = ?');
      args.push(params.department_id);
    }
    if (params.search) {
      conditions.push("(e.emp_firstname LIKE ? OR e.emp_lastname LIKE ? OR e.emp_pin LIKE ?)");
      const like = `%${params.search}%`;
      args.push(like, like, like);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const total = this.db.count(
      `SELECT COUNT(*) as cnt FROM hr_employee e ${where}`,
      args,
    );

    const data = this.db.query(
      `SELECT e.id, e.emp_pin, e.emp_firstname, e.emp_lastname, e.emp_title,
              e.emp_email, e.emp_phone, e.emp_active, e.emp_hiredate, e.emp_firedate,
              e.emp_gender, e.emp_birthday, e.nationalID, e.emp_cardNumber,
              e.department_id, d.dept_name,
              e.position_id, p.posi_name
       FROM hr_employee e
       LEFT JOIN hr_department d ON d.id = e.department_id
       LEFT JOIN hr_position p ON p.id = e.position_id
       ${where}
       ORDER BY e.emp_firstname
       LIMIT ? OFFSET ?`,
      [...args, limit, offset],
    );

    return { total, limit, offset, data };
  }

  findOne(id: number) {
    return this.db.queryOne(
      `SELECT e.*, d.dept_name, p.posi_name
       FROM hr_employee e
       LEFT JOIN hr_department d ON d.id = e.department_id
       LEFT JOIN hr_position p ON p.id = e.position_id
       WHERE e.id = ?`,
      [id],
    );
  }

  findByPin(pin: string) {
    return this.db.queryOne(
      `SELECT e.*, d.dept_name, p.posi_name
       FROM hr_employee e
       LEFT JOIN hr_department d ON d.id = e.department_id
       LEFT JOIN hr_position p ON p.id = e.position_id
       WHERE e.emp_pin = ?`,
      [pin],
    );
  }
}
