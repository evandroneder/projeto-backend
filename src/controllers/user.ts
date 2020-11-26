import * as userCollection from "@collections/users/users";
import {
  IRequestUpdateUser,
  IRegisterRequest,
  IContractRequest,
} from "@interfaces/request/user";
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

    if (user.avaliacoes.length > 0) {
      var soma = 0;
      for (let a of user.avaliacoes) {
        soma = soma + Number(a);
      }

      const result = soma / user.avaliacoes.length;
      user.nota = parseInt(result.toString());
    } else {
      user.nota = 1;
    }

    res.ok(user);
  } catch (e) {
    res.error(e);
  }
});

router.post("/contract", async (req: IRequest, res: IResponse) => {
  try {
    const user = req.body as IContractRequest;
    user.userId = req.session.userId;
    await userCollection.addContract(user);
    res.ok();
  } catch (e) {
    res.error(e);
  }
});

router.post("/endContract", async (req: IRequest, res: IResponse) => {
  try {
    const user = req.body as {
      guid: string;
      nota;
      _id: string;
    };
    await userCollection.endContract(user);
    res.ok();
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

    for (let user of users) {
      if (user.avaliacoes.length > 0) {
        var soma = 0;
        for (let a of user.avaliacoes) {
          soma = soma + Number(a);
        }

        const result = soma / user.avaliacoes.length;
        user.nota = parseInt(result.toString());
      } else {
        user.nota = 1;
      }
    }

    res.ok(users);
  } catch (e) {
    res.error(e);
  }
});

module.exports = router;
