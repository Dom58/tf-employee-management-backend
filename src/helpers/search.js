import Sequelize from 'sequelize';
import model from '../db/models/index';

const { Employee} = model;
const { Op } = Sequelize;
/**
 * search query
 */
class searchQuery {
  /**
   *
   * @param {object} query
   * @returns {object} employees
   */
  static async getQuery(query) {
    const { position, name, email,phone_number } = query;
    const employees = await Employee.findAll({
      where: {
        [Op.or]: [
          position ? { position: { [Op.iLike]: `%${position.trim()}%` } } : '',
          name ? { name: { [Op.iLike]: `%${name.trim()}%` } } : '',
          email ? { email: { [Op.iLike]: `%${email.trim()}%` } } : '',
          parseFloat(phone_number) ? { phone_number: { [Op.iLike]: `%${parseFloat(phone_number.trim())}%` } }: ''
        ]
      }
    });
    return employees;
  }
}
export default searchQuery;
