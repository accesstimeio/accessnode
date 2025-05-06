export const AccessTimeAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "ownerAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "deployerAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "feeWei",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "activateExtraTime",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "activatePackageModule",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "receive",
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "VERSION",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "acceptOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "accessTimes",
    inputs: [
      {
        name: "client",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "time",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "addExtra",
    inputs: [
      {
        name: "unixTime",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "percent",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "addPackage",
    inputs: [
      {
        name: "unixTime",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "extras",
    inputs: [
      {
        name: "extraId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "unixTime",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "percent",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "exist",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "packages",
    inputs: [
      {
        name: "packageId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "unixTime",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "exist",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pendingOwner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "purchase",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "paymentToken",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "purchasePackage",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "paymentToken",
        type: "address",
        internalType: "address"
      },
      {
        name: "packageID",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "toggleExtraTimeModule",
    inputs: [],
    outputs: [
      {
        name: "newStatus",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "togglePackageModule",
    inputs: [],
    outputs: [
      {
        name: "newStatus",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "tokenRates",
    inputs: [
      {
        name: "paymentToken",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "rate",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "updateExtra",
    inputs: [
      {
        name: "extraID",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "unixTime",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "percent",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "updatePackage",
    inputs: [
      {
        name: "packageID",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "unixTime",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "updateRate",
    inputs: [
      {
        name: "paymentToken",
        type: "address",
        internalType: "address"
      },
      {
        name: "rate",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "withdrawEther",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "withdrawToken",
    inputs: [
      {
        name: "tokenAddress",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "ExtraTimed",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "unixTime",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "newTime",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ExtraUpdated",
    inputs: [
      {
        name: "extraID",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "unixTime",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "percent",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ModuleStatusUpdated",
    inputs: [
      {
        name: "moduleKey",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      },
      {
        name: "newStatus",
        type: "bool",
        indexed: true,
        internalType: "bool"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferStarted",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PackageUpdated",
    inputs: [
      {
        name: "packageID",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "time",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Paused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Purchased",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "paymentToken",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PurchasedPackage",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "paymentToken",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "packageID",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "RateUpdate",
    inputs: [
      {
        name: "paymentToken",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "rate",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Unpaused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "DeployerCantBeZeroAddress",
    inputs: []
  },
  {
    type: "error",
    name: "EnforcedPause",
    inputs: []
  },
  {
    type: "error",
    name: "EtherOrToken",
    inputs: []
  },
  {
    type: "error",
    name: "ExpectedPause",
    inputs: []
  },
  {
    type: "error",
    name: "ExtraTimeNotFound",
    inputs: [
      {
        name: "extraID",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "InvalidFee",
    inputs: []
  },
  {
    type: "error",
    name: "ModuleNotAsExpected",
    inputs: [
      {
        name: "moduleName",
        type: "bytes32",
        internalType: "bytes32"
      }
    ]
  },
  {
    type: "error",
    name: "NotSupported",
    inputs: [
      {
        name: "paymentToken",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "OnlyDeployerAuthorized",
    inputs: []
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "PackageNotFound",
    inputs: [
      {
        name: "packageID",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "PaymentCantBeZero",
    inputs: []
  },
  {
    type: "error",
    name: "PurchaseMinOneSecond",
    inputs: []
  },
  {
    type: "error",
    name: "PurchaseTimeNotEqualToPackageTime",
    inputs: []
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: []
  },
  {
    type: "error",
    name: "WithdrawEtherFailed",
    inputs: []
  }
] as const;
