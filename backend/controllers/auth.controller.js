const authService = require('../services/auth.service');

class AuthController {
  async signup(req, res, next) {
    try {
      const studentData = req.body;
      const registeredStudent = await authService.registerStudent(studentData);
      
      return res.status(201).json({
        success: true,
        message: 'Student account created successfully.',
        data: registeredStudent
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password.' });
      }

      const sessionData = await authService.loginStudent(email, password);
      
      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: sessionData
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();