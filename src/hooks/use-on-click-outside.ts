// 외부 클릭 이벤트 발생 시 특정 동작 실행

import { RefObject, useEffect } from "react";

type Event = MouseEvent | TouchEvent;

// ref: 외부 클릭을 감지하는 dom 요소 참조 , handler: 외부 클릭이 감지되었을 때 실행될 콜백 함수

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void
) => {

  useEffect(() => {
    const listener = (event: Event) => {
      // 현재 참조되는 dom 요소
      const el = ref?.current;
      // 마우스 클릭이 참조 요소 '내부'에서 발생 시 아무 일도 일어나지 않음
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }
      // 마우스 클릭이 참조 요소 '외부'에서 발생 시 핸들러 함수 실행
      handler(event);
    };

    // 이벤트 등록
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    // 이벤트 제거
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };

    // ref와 handler가 변경될 때마다 이 함수를 다시 실행
  }, [ref, handler]);
};