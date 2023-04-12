// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    uint256 private counter;

    constructor() {
        counter = 0;
    }

    function myFunction1() public {
        counter += 1;
        myFunction3();
    }

    function myFunction2() public {
        counter -= 1;
        myFunction3();
    }

    function myFunction3() private {
        counter *= 2;
    }
}
