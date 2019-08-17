const makeZindexManager = () => {
  let index = 1000;
  return () => {
    index += 100;
    return index
  }
}

export const nextZindex = makeZindexManager();
