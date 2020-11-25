import * as userCollection from "@collections/users/users";
import { IRequestUpdateUser, IRegisterRequest } from "@interfaces/request/user";
import { IRequest, IResponse } from "@interfaces/http/core";
import { GetRouter } from "nd5-mongodb-server/core";

const router = GetRouter();

router.get("/profile", async (req: IRequest, res: IResponse) => {
  try {
    const session = req.session;

    const user = await userCollection.getUser([
      {
        $match: {
          _id: session.userId,
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    if (!user) return res.badRequest(`Usuário '${name}' não encontrado.`);

    res.ok(user);
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

router.get("/service", async (req: IRequest, res: IResponse) => {
  try {
    let users = await userCollection.getAllUsers([
      { $match: { "services.id": Number(req.query.id) } },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    res.ok(users);
  } catch (e) {
    res.error(e);
  }
});

module.exports = router;
