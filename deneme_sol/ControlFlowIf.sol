pragma solidity ^0.8.0;

contract ControlFlowExample {
    function myFunction() public {
        uint256 x = 5;
        if (x > 3) {
            x += 1;
        } else {
            x -= 1;
        }

        for (uint256 i = 0; i < 10; i++) {
            x *= 2;
        }

        while (x > 0) {
            x -= 1;
        }
    }
}
