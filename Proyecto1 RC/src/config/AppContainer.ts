import { AuthController } from '../controllers/AuthController';
import { RegisterController } from '../controllers/RegisterController';
import { Database } from '../database/Database';
import { SqliteUserDao } from '../database/SqliteUserDao';
import { UserRepository } from '../repository/UserRepository';
import { ApiClient } from '../services/ApiClient';
import { AuthService } from '../services/AuthService';
import { NetworkService } from '../services/NetworkService';
import { StorageService } from '../services/StorageService';
import { UserService } from '../services/UserService';
import { CryptoPasswordHasher } from '../utils/security';

const database = Database.getInstance();
const userDao = new SqliteUserDao(database);
const hasher = new CryptoPasswordHasher();
const userRepository = new UserRepository(userDao, hasher);

export const registerController = new RegisterController(userRepository);

const apiClient = new ApiClient();
export const authController = new AuthController({
  authService: new AuthService(apiClient),
  userService: new UserService(apiClient),
  storageService: new StorageService(),
  networkService: new NetworkService(),
});
