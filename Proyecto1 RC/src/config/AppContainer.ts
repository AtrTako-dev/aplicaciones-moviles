import { AuthController } from '../controllers/AuthController';
import { CartController } from '../controllers/CartController';
import { CatalogController } from '../controllers/CatalogController';
import { RegisterController } from '../controllers/RegisterController';
import { Database } from '../database/Database';
import { SqliteUserDao } from '../database/SqliteUserDao';
import { UserRepository } from '../repository/UserRepository';
import { ApiClient } from '../services/ApiClient';
import { AuthService } from '../services/AuthService';
import { FakeStoreCartProductService } from '../services/CartProductService';
import { CartService } from '../services/CartService';
import { CartStorageService } from '../services/CartStorageService';
import { NetworkService } from '../services/NetworkService';
import { ProductService } from '../services/ProductService';
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

export const catalogController = new CatalogController(
  new ProductService(apiClient),
  new NetworkService(),
);

// #################### US10: Composición del controlador del carrito ####################
export function crearCartController(userId: number): CartController {
  return new CartController({
    userId,
    cartService: new CartService(apiClient),
    productos: new FakeStoreCartProductService(),
    storage: new CartStorageService(),
  });
}
// #################################### Fin de US10 ####################################
