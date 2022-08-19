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
import AccumlateCertifies from "../models/accumlateCertifies";

const app = Router();

//루틴 생성

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const createRoutine = async (req, res) => {
  const { routineName, routineContents, routinePlan, routineType } = req.body;

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
  routine.routineType = routineType;

  await routine.save();

  res.status(NO_CONTENT).send();
};

//루틴 참여

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
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
      errors.ROUTINE_ALREADY_PARTICIPATE.statusCode,
      errors.ROUTINE_ALREADY_PARTICIPATE.errorCode,
      errors.ROUTINE_ALREADY_PARTICIPATE.errorMsg
    );
  }

  await Routine.findByIdAndUpdate(routineId, {
    $push: {
      routineClients: res.locals.client.id,
    },
  });

  res.status(NO_CONTENT).send();
};

//루틴 탈퇴

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
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
      errors.ROUTINE_ALREADY_NOT_PARTICIPATE.statusCode,
      errors.ROUTINE_ALREADY_NOT_PARTICIPATE.errorCode,
      errors.ROUTINE_ALREADY_NOT_PARTICIPATE.errorMsg
    );
  }

  await Routine.findByIdAndUpdate(routineId, {
    $pull: {
      routineClients: res.locals.client.id,
    },
  });

  res.status(NO_CONTENT).send();
};

//루틴 완료

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const completeRoutine = async (req, res) => {
  const { routineId } = req.params;
  const { id: clientId } = res.locals.client;

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
      errors.ROUTINE_ALREADY_NOT_PARTICIPATE.statusCode,
      errors.ROUTINE_ALREADY_NOT_PARTICIPATE.errorCode,
      errors.ROUTINE_ALREADY_NOT_PARTICIPATE.errorMsg
    );
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const routineDays = [];

  for (let i = 0; i < 7; i++) {
    const eachDay = routine.routineDay[i];
    routineDays.push(eachDay);
  }

  const routineDayIndex = routineDays.findIndex((d) => today.getDay());
  if (routineDayIndex === -1) {
    // 오늘은 루틴 마킹이 안되는 날  ~

    throw new APIError(
      errors.ROUTINE_CANT_COMPLETE.statusCode,
      errors.ROUTINE_CANT_COMPLETE.errorCode,
      errors.ROUTINE_CANT_COMPLETE.errorMsg
    );
  }

  let prevIndex = routineDayIndex - 1;
  if (prevIndex < 0) {
    prevIndex += routineDays.length;
  }

  let dayDelta = 0;

  if (routineDays.length === 1) {
    dayDelta = 7;
  } else {
    if (routineDayIndex > prevIndex) {
      dayDelta = routineDayIndex - prevIndex;
    } else {
      dayDelta = 7 - prevIndex + routineDayIndex;
    }
  }

  today.getDay();

  const lastDay = new Date();
  lastDay.setUTCHours(0, 0, 0, 0);
  lastDay.setDate(lastDay.getDate() - dayDelta);
  // -1

  const completed = await RoutineCertify.exists({
    routineDate: today,
    client: clientId,
    routineId,
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

  const filter = {
    contentId: routineId,
    writerId: res.locals.client.id,
  };

  //인증 스키마에 이미 있으면 1일 누적, 처음이면 1일 시작
  const accumlate = await AccumlateCertifies.findOne(filter);
  if (accumlate) {
    const lastCertify = await RoutineCertify.findOne({
      contentId: routineId,
      writerId: res.locals.client.id,
      routineDate: lastDay,
    });
    if (lastCertify) {
      await AccumlateCertifies.findOneAndUpdate(filter, {
        $inc: { contentCount: +1 },
      });
    } else {
      await AccumlateCertifies.findOneAndUpdate(filter, {
        $set: { contentCount: 1 },
      });
    }
  } else {
    const accumlatecertifies = new AccumlateCertifies();
    accumlatecertifies.contentId = routineId;
    accumlatecertifies.writerId = res.locals.client.id;
    accumlatecertifies.writerName = res.locals.client.name;

    await accumlatecertifies.save();
  }
  res.status(httpStatus.NO_CONTENT).send();
};

//루틴조회

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getRoutine = async (req, res) => {
  const { type } = req.params;
  const routines = await Routine.find({
    routineType: type,
    routineClients: {
      $in: res.locals.client.id,
    },
  });

  res.status(httpStatus.OK).json({ routines });
};

//완료한 루틴 조회

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getCompletedRoutine = async (req, res) => {
  const { clientId, routineId } = req.params;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const filter = {
    routineDate: today,
    client: clientId,
    routineId,
  };

  console.log(filter);

  const routine = await RoutineCertify.exists(filter);

  console.log(routine);

  res.status(httpStatus.OK).json({ completed: routine });
};

//루틴 누적일 조회
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getAccumlate = async (req, res) => {
  const { routineId } = req.params;
  const accumlateInfo = await AccumlateCertifies.findOne(
    {
      contentId: routineId,
      writerId: res.locals.client.id,
    },
    {
      contentId: false,
      writerId: false,
      __v: false,
      _id: false,
      writerName: false,
    }
  );
  res.status(httpStatus.OK).json(accumlateInfo);
};

// 완료한 루틴 & 전체 루틴 개수

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getRoutineCounts = async (req, res) => {
  const { id } = res.locals.client;

  const routines = await Routine.find({ routineClients: { $in: id } });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let completed = 0;

  for (const routine of routines) {
    const certifyExists = await RoutineCertify.exists({
      routineId: routine.id,
      client: id,
      routineDate: today,
    });
    if (certifyExists) {
      completed += 1;
    }
  }

  res.json({
    routineCount: routines.length,
    completedRoutineCount: completed,
  });
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const setRoutineDay = async (req, res) => {
  const { routineId } = req.params;
  const { routineDay } = req.body;

  await Routine.findByIdAndUpdate(routineId, { $set: { routineDay } });
  res.status(httpStatus.NO_CONTENT).send();
};

app.post(
  "/",
  body("routineName").not().isEmpty(),
  body("routineContents").not().isEmpty(),
  body("routinePlan").not().isEmpty(),
  body("routineType").not().isEmpty(),
  validation,
  verifyToken,
  asyncWrapper(createRoutine)
); // 루틴생성

app.post(
  "/:routineId",
  param("routineId").not().isEmpty(),
  validation,
  verifyToken,
  asyncWrapper(participateRoutine)
); // 루틴참여

app.delete(
  "/:routineId",
  param("routineId").not().isEmpty(),
  validation,
  verifyToken,
  asyncWrapper(exitRoutine)
); // 루틴탈퇴

app.post(
  "/complete/:routineId",
  param("routineId").not().isEmpty(),
  validation,
  verifyToken,
  asyncWrapper(completeRoutine)
); // 루틴완료

app.get(
  "/complete/:routineId/:clientId",
  param("routineId").not().isEmpty(),
  param("clientId").not().isEmpty(),
  validation,
  verifyToken,
  asyncWrapper(getCompletedRoutine)
); //완료한 루틴 조회

app.get(
  "/:type",
  param("type").not().isEmpty(),
  validation,
  verifyToken,
  asyncWrapper(getRoutine)
); // 루틴조회

app.get(
  "/accumlate/:routineId/",
  param("routineId").not().isEmpty(),
  validation,
  verifyToken,
  asyncWrapper(getAccumlate)
); //루틴 누적일 조회

app.get(
  "/count/count",
  validation,
  verifyToken,
  asyncWrapper(getRoutineCounts)
); //루틴 누적일 조회

app.post(
  "/day/:routineId",
  param("routineId").not().isEmpty(),
  body("routineDay").isArray({ min: 7, max: 7 }),
  validation,
  verifyToken,
  asyncWrapper(setRoutineDay)
); //루틴 누적일 조회

export default app;
