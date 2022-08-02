import { Router, Request, Response } from "express";
import { body, param } from "express-validator";
import httpStatus, { NO_CONTENT } from "http-status";
import validation from "../middleware/validation";
import verifyToken from "../middleware/verifyTK";
import Routine from "../models/routine";
import APIError from "../util/apiError";
import asyncWrapper from "../util/asyncWrapper";
import errors from "../util/errors";
import RoutineCertify from "../models/routineCertify";

const app = Router();

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
//루틴 생성
const createRoutine = async (req, res) => {
  const { routineName, routineContents, routinePlan } = req.body;

  if (await Routine.exists({ routineName })) {
    throw new APIError(
      errors.ROUTINE_NAME_ALREADY_EXISTS.statusCode,
      errors.ROUTINE_NAME_ALREADY_EXISTS.errorCode,
      errors.ROUTINE_NAME_ALREADY_EXISTS.errorMsg
    );
  }

  const routine = new Routine();
  routine.routineName = routineName;
  routine.routineContents = routineContents;
  routine.routinePlan = routinePlan;
  routine.routineClients = [res.locals.client.id];

  await routine.save();

  res.status(NO_CONTENT).send();
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
//루틴 참여
const participateRoutine = async (req, res) => {
  const { routineId } = req.params;

  const routine = await Routine.findById(routineId);

  if (!routine) {
    throw new APIError(
      errors.ROUTINE_NOT_EXISTS.statusCode,
      errors.ROUTINE_NOT_EXISTS.errorCode,
      errors.ROUTINE_NOT_EXISTS.errorMsg
    );
  }

  const routineContainsClient = routine.routineClients.find((id) =>
    id.equals(res.locals.client.id)
  );

  if (routineContainsClient) {
    throw new APIError(
      errors.ROUTINE_NAME_ALREADY_PARTICIPATE.statusCode,
      errors.ROUTINE_NAME_ALREADY_PARTICIPATE.errorCode,
      errors.ROUTINE_NAME_ALREADY_PARTICIPATE.errorMsg
    );
  }

  await Routine.findByIdAndUpdate(routineId, {
    $push: {
      routineClients: res.locals.client.id,
    },
  });

  res.status(NO_CONTENT).send();
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
//루틴 탈퇴
const exitRoutine = async (req, res) => {
  const { routineId } = req.params;

  const routine = await Routine.findById(routineId);

  if (!routine) {
    throw new APIError(
      errors.ROUTINE_NOT_EXISTS.statusCode,
      errors.ROUTINE_NOT_EXISTS.errorCode,
      errors.ROUTINE_NOT_EXISTS.errorMsg
    );
  }

  const routineContainsClient = routine.routineClients.find((id) =>
    id.equals(res.locals.client.id)
  );

  if (!routineContainsClient) {
    throw new APIError(
      errors.ROUTINE_NAME_ALREADY_NOT_PARTICIPATE.statusCode,
      errors.ROUTINE_NAME_ALREADY_NOT_PARTICIPATE.errorCode,
      errors.ROUTINE_NAME_ALREADY_NOT_PARTICIPATE.errorMsg
    );
  }

  await Routine.findByIdAndUpdate(routineId, {
    $pull: {
      routineClients: res.locals.client.id,
    },
  });

  res.status(NO_CONTENT).send();
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
//루틴 완료
const completeRoutine = async (req, res) => {
  const { routineId } = req.params;

  const routine = await Routine.findById(routineId);

  if (!routine) {
    throw new APIError(
      errors.ROUTINE_NOT_EXISTS.statusCode,
      errors.ROUTINE_NOT_EXISTS.errorCode,
      errors.ROUTINE_NOT_EXISTS.errorMsg
    );
  }

  const routineContainsClient = routine.routineClients.find((id) =>
    id.equals(res.locals.client.id)
  );

  if (routineContainsClient) {
    throw new APIError(
      errors.ROUTINE_NAME_ALREADY_NOT_PARTICIPATE.statusCode,
      errors.ROUTINE_NAME_ALREADY_NOT_PARTICIPATE.errorCode,
      errors.ROUTINE_NAME_ALREADY_NOT_PARTICIPATE.errorMsg
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completed = await RoutineCertify.exists({
    routineDate: today,
  });

  if (completed) {
    throw new APIError(
      errors.ROUTINE_ALREADY_COMPLETED.statusCode,
      errors.ROUTINE_ALREADY_COMPLETED.errorCode,
      errors.ROUTINE_ALREADY_COMPLETED.errorMsg
    );
  }

  const routineCertify = new RoutineCertify();
  routineCertify.routineDate = today;
  routineCertify.routineId = routineId;
  routineCertify.client = res.locals.client.id;

  await routineCertify.save();

  res.status(httpStatus.NO_CONTENT).send();
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
//루틴조회
const getRoutine = async (req, res) => {
  const routines = await Routine.find({
    routineClients: {
      $in: res.locals.client.id,
    },
  });

  res.status(httpStatus.OK).json({ routines });
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
//완료한 루틴 조회
const getCompletedRoutine = async (req, res) => {
  const { clientId, routineId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const routine = await RoutineCertify.findOne({
    routineDate: today,
    client: clientId,
    routineId,
  });

  res.status(httpStatus.OK).json({ completed: routine ? true : false });
};

app.post(
  "/",
  body("routineName").exists(),
  body("routineContents").exists(),
  body("routinePlan").exists(),
  validation,
  verifyToken,
  asyncWrapper(createRoutine)
); // 루틴생성

app.post(
  "/:routineId",
  param("routineId").exists(),
  validation,
  verifyToken,
  asyncWrapper(participateRoutine)
); // 루틴참여

app.delete(
  "/:routineId",
  param("routineId").exists(),
  validation,
  verifyToken,
  asyncWrapper(exitRoutine)
); // 루틴탈퇴

app.post(
  "/complete/:routineId",
  param("routineId").exists(),
  validation,
  verifyToken,
  asyncWrapper(completeRoutine)
); // 루틴완료

app.get(
  "/complete/:routineId/:clientId",
  param("routineId").exists(),
  validation,
  verifyToken,
  asyncWrapper(getCompletedRoutine)
);

app.get("/", verifyToken, asyncWrapper(getRoutine)); // 루틴조회

export default app;
