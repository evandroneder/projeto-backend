import * as userCollection from "@collections/users/users";
import { IRequestUpdateUser, IRegisterRequest } from "@interfaces/request/user";
import { IRequest, IResponse } from "@interfaces/http/core";
import { GetRouter } from "nd5-mongodb-server/core";
import { IUser } from "@interfaces/collection/user";
import { IPostResponse } from "@interfaces/request/post";

const router = GetRouter();

router.get("/profile", async (req: IRequest, res: IResponse) => {
  try {
    const session = req.session;

    var userData: {
      data: IUser;
      posts: IPostResponse[];
      myProfile: boolean;
      following: boolean;
    } = {
      data: undefined,
      posts: undefined,
      myProfile: undefined,
      following: false,
    };

    userData.data = await userCollection.getUser([
      {
        $match: {
          _id: session.userId,
        },
      },
      {
        $project: {
          password: 0,
          notificationSubscription: 0,
        },
      },
    ]);

    if (!userData.data)
      return res.badRequest(`Usuário '${name}' não encontrado.`);

    res.ok(userData);
  } catch (e) {
    res.error(e);
  }
});

router.post("/", async (req: IRequest, res: IResponse) => {
  try {
    const user = req.body as IRegisterRequest;
    await userCollection.createUser(user);
    res.ok();
  } catch (e) {
    res.error(e);
  }
});

router.put("/", async (req: IRequest, res: IResponse) => {
  try {
    const session = req.session;
    const user = req.body as IRequestUpdateUser;
    user._id = session.userId;
    await userCollection.updateUser(user);
    res.ok();
  } catch (e) {
    res.error(e);
  }
});

router.get("/settings", async (req: IRequest, res: IResponse) => {
  try {
    const session = req.session;
    let user = await userCollection.getUser([
      {
        $match: {
          _id: session.userId,
        },
      },
      {
        $project: {
          _id: 0,
          password: 0,
        },
      },
    ]);

    res.ok(user);
  } catch (e) {
    res.error(e);
  }
});

module.exports = router;
