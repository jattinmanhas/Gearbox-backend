import dayjs from "dayjs";
import { User } from "../models/user";
import * as crypto from 'crypto';
import { UserAttributes, userPayload } from "../types/dbtypes";

export async function checkUsernameorEmailExists(
  value: string,
  credentials: string
) {
  try {
    const user = await User.findOne({
      where: {
        [credentials]: value,
      },
    });

    if (user) {
      return true;
    }
    return false;
  } catch (error: any) {
    console.log(error);
  }
}

export function getDifferenceOfTwoDatesInTime(
  currentDate: dayjs.Dayjs,
  toDate: dayjs.Dayjs
) {
  let hours = toDate.diff(currentDate, "hour");
  currentDate = currentDate.add(hours, "hour");
  let minutes = toDate.diff(currentDate, "minute");
  currentDate = currentDate.add(minutes, "minute");
  let seconds = toDate.diff(currentDate, "second");
  currentDate = currentDate.add(seconds, "second");
  if (hours) {
    return `${hours} hour, ${minutes} minute and ${seconds} second`;
  }
  return `${minutes} minute and ${seconds} second`;
}

export function userPayloadFunction(user: any): userPayload{
  const {id, username, email, name} = user;
  ;
  const userPayload: userPayload = {
    id: id,
    username : username,
    email: email,
    name: name
  }

  return userPayload;
}