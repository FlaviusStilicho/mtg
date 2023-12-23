export function Sleep(ms: number) {
  var waitTill = new Date(new Date().getTime() + ms);
  while (waitTill > new Date()) {}
}
