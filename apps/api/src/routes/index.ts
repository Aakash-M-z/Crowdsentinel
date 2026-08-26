import { Router, type IRouter } from "express";
import healthRouter from "./health";
import crowdRouter from "./crowd";
import experimentsRouter from "./experiments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(crowdRouter);
router.use(experimentsRouter);

export default router;