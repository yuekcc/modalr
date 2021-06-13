const makeZIndexManager = () => {
  let index = 1000;
  return () => {
    index += 100;
    return index;
  };
};

export const nextZIndex = makeZIndexManager();
