const userRepository = require('../repositories/user.repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  /**
   * Handles student registration / signup
   */
  async registerStudent(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error('A student with this email is already registered.');
      error.statusCode = 400;
      throw error;
    }

    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Save user with hashed password
    const newUser = await userRepository.createUser({
      ...userData,
      password: hashedPassword
    });

    // Remove password from returned object
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return userResponse;
  }

  /**
   * Handles student login
   */
  async loginStudent(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Verify password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT Token valid for 7 days
    const token = jwt.sign(
      { userId: user._id, grade: user.grade, schoolName: user.schoolName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      student: {
        id: user._id,
        name: user.name,
        email: user.email,
        grade: user.grade,
        schoolName: user.schoolName,
        streakCount: user.streakCount
      }
    };
  }
}

module.exports = new AuthService();