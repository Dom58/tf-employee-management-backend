import Joi from '@hapi/joi';

exports.signupValidator = (user, res) => {
  const signupSchema = Joi.object().keys({
      name: Joi.string().required().label('Name'),
      national_id: Joi.string().min(16).max(16).required()
      .options({ language: { string: { regex: { base: 'please remove spaces between word!' } } } })
      .label('National Id'),
      email: Joi.string().email().insensitive().required()
      .label('Email'),
      phone_number: Joi.string().required().min(9).max(9).label('Phone mumber'),
      date_birth: Joi.string().required().label('Date of Birth'),
      status: Joi.string(),
      position: Joi.string().label('Position'),
      password: Joi.string().regex(/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/).required().label("Password")
      .options({ language: { string: { regex: { base: 'must contain at least One Digit - One Special Character - One Lowercase and One Uppercase Letter!' } } } }),
  });

  const checkUser = Joi.validate(user, signupSchema, {
      abortEarly: false
  });
  if (checkUser.error) {
      const errors = [];
      for (let i = 0; i < checkUser.error.details.length; i += 1) {
        errors.push(checkUser.error.details[i].message.replace('"', ' ').replace('"', ' '));
      }
      return errors;
  }
},
exports.loginValidator = (user) => {
  const loginSchema = Joi.object().keys({
      email: Joi.string().email().insensitive().required()
      .label('Email'),
      password: Joi.string().required().label('Password'),
  });

  const checkUser = Joi.validate(user, loginSchema, {
      abortEarly: false
  });
  if (checkUser.error) {
      const errors = [];
      for (let i = 0; i < checkUser.error.details.length; i += 1) {
        errors.push(checkUser.error.details[i].message.replace('"', ' ').replace('"', ' '));
      }
      return errors;
  }
},
exports.updateProfileValidator = (manager, res) => {
  const ManagerSchema = Joi.object().keys({
      name: Joi.string().label('Name').min(3),
      national_id: Joi.string().min(16).max(16).trim()
      .options({ language: { string: { regex: { base: 'please remove spaces between word!' } } } })
      .label('National Id'),
      email: Joi.string().email().insensitive()
      .label('Email'),
      phone_number: Joi.string().min(9).max(9).label('Phone mumber').options({ language: { string: { regex: { base: 'please remove spaces between word!' } } } }),
      date_birth: Joi.string().label('Date of Birth').options({ language: { string: { regex: { base: 'please remove spaces between word!' } } } })
  });

  const checkManager = Joi.validate(manager, ManagerSchema, {
      abortEarly: false
  });
  if (checkManager.error) {
      const errors = [];
      for (let i = 0; i < checkManager.error.details.length; i += 1) {
        errors.push(checkManager.error.details[i].message.replace('"', ' ').replace('"', ' '));
      }
      return errors;
  }
},
exports.resetPasswordValidator = (userPassword) => {
  const resetPassSchema = Joi.object().keys({
      password: Joi.string().regex(/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/).required().label("Password")
      .options({ language: { string: { regex: { base: 'must contain at least One Digit - One Special Character - One Lowercase and One Uppercase Letter!' } } } }),
      confirm_password: Joi.any().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match with password.' } } }).label("Confirm password"),
      token: Joi.string(),
  });

  const checkUser = Joi.validate(userPassword, resetPassSchema, {
      abortEarly: false
  });
  if (checkUser.error) {
      const errors = [];
      for (let i = 0; i < checkUser.error.details.length; i += 1) {
          errors.push(checkUser.error.details[i].message.replace('"', ' ').replace('"', ' ' ));
      }
      return errors;
  }
}
