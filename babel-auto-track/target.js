import _tracker2 from "tracker";
import aa from 'aa';
import * as bb from 'bb';
import { cc } from 'cc';
import 'dd'; // @track-ignore

function fun1() {
  console.log('aaa');
}

class B {
  fun2() {
    _tracker2("fun2");

    return 'bbb';
  }

}

const fun3 = () => {
  _tracker2('fun3');

  return 'ccc';
};

const fun4 = function () {
  _tracker2("fun4");

  console.log('ddd');
};