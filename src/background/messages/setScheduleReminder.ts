import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage as ChromeStorage } from "@plasmohq/storage";
import { differenceInMinutes } from "date-fns";

import type { Schedule, ScheduleMap } from "@/types/Schedule";

// スケジュールを受け取って、Chromeのアラームを設定するハンドラ
const handler: PlasmoMessaging.MessageHandler<Schedule[], void> = async (
  messageRequest,
  messageResponse,
) => {
  // リクエストからスケジュールを取り出す
  const schedules = messageRequest.body ?? [];

  // FIXME: 以前に登録されたChromeのアラームを削除する(ここに書くのは微妙)
  chrome.alarms.clearAll();

  schedules.forEach((schedule) => {
    // PrefixとIDの組み合わせをアラームの名前として扱う(アラーム名から対象のスケジュールを逆引きするときに使用する)
    const alarmName = "SCHEDULE" + "-" + schedule.id;

    // 実際の予定が始まる3分前に通知するよう差分から引いておく
    const timeDifference = differenceInMinutes(schedule.start, new Date()) - 3;

    // 通知対象となるスケジュールに対して、Chromeのアラームを設定する
    if (timeDifference > 0) {
      chrome.alarms.create(alarmName, {
        delayInMinutes: timeDifference,
      });
    }
  });

  // IDからスケジュールを逆引きするためのMapを作成する
  const scheduleMap: ScheduleMap = schedules.reduce((map, schedule) => {
    const alarmName = "SCHEDULE" + "-" + schedule.id;
    map[alarmName] = schedule;

    return map;
  }, {});

  //作成したMapをChromeのストレージに格納する
  const storage = new ChromeStorage();
  storage.set("scheduleMap", scheduleMap);

  // BSWから別の世界にレスポンスを返す
  messageResponse.send();
};

export default handler;
