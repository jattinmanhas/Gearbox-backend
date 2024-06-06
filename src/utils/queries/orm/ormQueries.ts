import { CreateOptions, FindOptions, Model } from "sequelize";

export async function createOne<T extends Model>(
  model: {
    new (): T;
    create: (values?: object, options?: CreateOptions) => Promise<T | null>;
  },
  data: object
){
  try {
    const result = await model.create(data);
    
    return result;
  } catch (error: any) {
    throw new Error(`Error creating entry: ${error.message}`);
  }
}

export async function findOne<T extends Model>(
  model: {
    new (): T;
    findOne: (options: FindOptions) => Promise<T | null>;
  },
  query: FindOptions
) {
  try {
    // Find the created user
    const foundUser = await model.findOne(query);

    return foundUser?.dataValues;
  } catch (error) {
    console.error("Error:", error);
  }
}
