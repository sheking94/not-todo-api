import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AnyZodObject } from "zod";

const validateResource =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      return res.status(StatusCodes.BAD_REQUEST).send(e.errors);
    }
  };

export default validateResource;
