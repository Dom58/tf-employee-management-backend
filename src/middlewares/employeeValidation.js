import Joi from '@hapi/joi';

exports.createEmployeeValidator = (employee, res) => {
  const employeeSchema = Joi.object().keys({
      name: Joi.string().required().label('Name'),
      national_id: Joi.string().min(16).max(16).required()
      .options({ language: { string: { regex: { base: 'please remove spaces between word!' } } } })
      .label('National Id'),
      email: Joi.string().email().insensitive().required()
      .label('Email'),
      phone_number: Joi.string().required().min(9).max(9).label('Phone mumber'),
      date_birth: Joi.string().required().label('Date of Birth'),
      status: Joi.string().valid('active', 'inactive'),
      position: Joi.string().label('Position')
  });

  const checkUser = Joi.validate(employee, employeeSchema, {
      abortEarly: false
  });
  if (checkUser.error) {
      const errors = [];
      for (let i = 0; i < checkUser.error.details.length; i += 1) {
        errors.push(checkUser.error.details[i].message.replace('"', ' ').replace('"', ' '));
      }
      return errors;
  }
}

exports.updateEmployeeValidator = (employee, res) => {
  const employeeSchema = Joi.object().keys({
      name: Joi.string().label('Name').min(3),
      national_id: Joi.string().min(16).max(16)
      .options({ language: { string: { regex: { base: 'please remove spaces between word!' } } } })
      .label('National Id'),
      email: Joi.string().email().insensitive()
      .label('Email'),
      phone_number: Joi.string().min(9).max(9).label('Phone mumber'),
      date_birth: Joi.string().label('Date of Birth'),
      status: Joi.string().valid('active', 'inactive'),
      position: Joi.string().label('Position')
  });

  const checkEmployee = Joi.validate(employee, employeeSchema, {
      abortEarly: false
  });
  if (checkEmployee.error) {
      const errors = [];
      for (let i = 0; i < checkEmployee.error.details.length; i += 1) {
        errors.push(checkEmployee.error.details[i].message.replace('"', ' ').replace('"', ' '));
      }
      return errors;
  }
}

exports.activateEmployeeValidator = (employee, res) => {
  const employeeSchema = Joi.object().keys({
      status: Joi.string().valid('active')
  });

  const checkEmployee = Joi.validate(employee, employeeSchema, {
      abortEarly: false
  });
  if (checkEmployee.error) {
      const errors = [];
      for (let i = 0; i < checkEmployee.error.details.length; i += 1) {
        errors.push(checkEmployee.error.details[i].message.replace('"', ' ').replace('"', ' '));
      }
      return errors;
  }
}

exports.suspandEmployeeValidator = (employee, res) => {
  const employeeSchema = Joi.object().keys({
      status: Joi.string().valid('inactive')
  });

  const checkEmployee = Joi.validate(employee, employeeSchema, {
      abortEarly: false
  });
  if (checkEmployee.error) {
      const errors = [];
      for (let i = 0; i < checkEmployee.error.details.length; i += 1) {
        errors.push(checkEmployee.error.details[i].message.replace('"', ' ').replace('"', ' '));
      }
      return errors;
  }
}
