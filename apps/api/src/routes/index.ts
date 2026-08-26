import { Router, type IRouter } from "express";
import healthRouter from "./health";
import crowdRouter from "./crowd";

const router: IRouter = Router();

router.use(healthRouter);
router.use(crowdRouter);

export default router;
