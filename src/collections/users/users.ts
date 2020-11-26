import { getColletion } from "nd5-mongodb-server/mongo";
import { environment } from "@env/environment.prod";
import {
  IRequestUpdateUser,
  IRegisterRequest,
  IContractRequest,
} from "@interfaces/request/user";

import { IUser, userType } from "@interfaces/collection/user";

import { encrypt } from "@lib/crypto";
import { ObjectId } from "mongodb";
import { generateUUID } from "@lib/session";

const { collection } = getColletion({
  collection: "users",
  db: environment.db,
});

export async function getAllUsers(filter?: any[]) {
  try {
    return await collection.aggregate<IUser>(filter).toArray();
  } catch (e) {
    throw "Erro criando usuário: " + e;
  }
}

export async function getUser(filter?: any[]): Promise<IUser> {
  try {
    let users = await getAllUsers(filter);
    return users[0];
  } catch (e) {
    throw "Erro criando usuário: " + e;
  }
}

export async function createUser(user: IRegisterRequest) {
  try {
    const hasUser = await getUser([{ $match: { email: user.email } }]);
    if (hasUser) throw "Usuário ja cadastrado.";
    user.password = encrypt(user.password);
    const newUser: IUser = {
      name: user.name,
      email: user.email,
      password: user.password,
      type: user.type,
      phone: user.phone,
      services: user.services,
      avaliacoes: [],
    };
    await collection.insertOne(newUser);
  } catch (e) {
    throw "Erro criando usuário: " + e;
  }
}

export async function addContract(payload: IContractRequest) {
  try {
    const user = await getUser([{ $match: { _id: payload.userId } }]);

    if (user.type === userType.empresa) {
      throw "Usuários do tipo empresa não podem contratar um serviço.";
    }

    const guid = generateUUID();
    await collection.updateOne(
      { _id: payload.userId },
      {
        $push: {
          contracts: {
            _id: new ObjectId(payload._id),
            guid,
            description: payload.description,
            name: payload.name,
            pending: true,
            phone: payload.phone,
          },
        },
      }
    );

    await collection.updateOne(
      { _id: new ObjectId(payload._id) },
      {
        $push: {
          contracts: {
            _id: user._id,
            name: user.name,
            description: payload.description,
            pending: true,
            guid,
            phone: user.phone,
          },
        },
      }
    );
  } catch (e) {
    throw "Erro ao contratar serviço: " + e;
  }
}

export async function endContract(payload: {
  guid: string;
  nota;
  _id: string;
}) {
  try {
    await collection.updateMany(
      { "contracts.guid": payload.guid },
      {
        $set: { "contracts.$.pending": false },
      }
    );

    await collection.updateOne(
      { _id: new ObjectId(payload._id) },
      {
        $push: {
          avaliacoes: payload.nota,
        },
      }
    );
  } catch (e) {
    throw "Erro ao finalizar serviço: " + e;
  }
}

export async function follow(payload: {
  followerUserId: ObjectId;
  followingUserId: ObjectId;
}) {
  try {
    const result = await collection.findOne({
      _id: payload.followerUserId,
      following: payload.followingUserId,
    });
    if (!result)
      await collection.updateOne(
        { _id: payload.followerUserId },
        {
          $push: {
            following: payload.followingUserId,
          },
        }
      );

    await collection.updateOne(
      { _id: payload.followingUserId },
      {
        $push: {
          followers: payload.followerUserId,
        },
      }
    );
  } catch (e) {
    throw "Erro ao seguir usuário: " + e;
  }
}

export async function unfollow(payload: {
  followerUserId: ObjectId;
  followingUserId: ObjectId;
}) {
  try {
    const result = await collection.findOne({
      _id: payload.followerUserId,
      following: payload.followingUserId,
    });
    if (result)
      await collection.updateOne(
        { _id: payload.followerUserId },
        { $pull: { following: payload.followingUserId } }
      );

    await collection.updateOne(
      { _id: payload.followingUserId },
      { $pull: { following: payload.followerUserId } }
    );
  } catch (e) {
    throw "Erro ao seguir usuário: " + e;
  }
}

export async function following(payload: {
  followerUserId: ObjectId;
  followingUserId: ObjectId;
}): Promise<boolean> {
  try {
    const result = await collection.findOne({
      _id: payload.followerUserId,
      following: payload.followingUserId,
    });
    if (result) return true;
    else return false;
  } catch (e) {
    throw "Erro ao seguir usuário: " + e;
  }
}
