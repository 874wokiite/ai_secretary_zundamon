import { sendToBackground } from "@plasmohq/messaging";
import { useEffect, useState } from "react";

import type { Schedule } from "@/types/Schedule";

type GetMessageState = {
  message: string | undefined;
  isLoading: boolean;
  error: any | undefined;
};

export const useGetMessage = (schedules: Schedule[] | undefined) => {
  const [state, setState] = useState<GetMessageState>({
    message: undefined,
    isLoading: true,
    error: undefined,
  });

  const fetch = async () => {
    try {
      setState({
        message: undefined,
        isLoading: true,
        error: undefined,
      });

      if (schedules) {
        const message = await sendToBackground<Schedule[], string>({
          name: "getMessage",
          body: schedules,
        });

        setState({
          message: message,
          isLoading: false,
          error: undefined,
        });
      }
    } catch (error: any) {
      setState({
        message: undefined,
        isLoading: false,
        error: error,
      });
    }
  };

  useEffect(() => {
    fetch();
  }, [schedules]);

  return { ...state, refetch: fetch };
};
