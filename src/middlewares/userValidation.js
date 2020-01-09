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
}
