// import '@testing-library/jest-dom/extend-expect';

jest.spyOn(global as any, 'requestAnimationFrame').mockImplementation((arg: any) => {
  setTimeout(arg, 0);
});
