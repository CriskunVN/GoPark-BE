import User from '../models/user.model.js';
import * as factory from './handlerFactory.controller.js'; // các hàm factory để xử lý CRUD

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
