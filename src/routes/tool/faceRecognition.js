import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import FaceRegconite from "~/scenes/FaceRegconite";
import ListCustomer from "~/scenes/FaceRegconite/ListCustomer";
import ListBadFace from "~/scenes/FaceRegconite/ListBadFace";
import ListPerson from "~/scenes/FaceRegconite/ListPerson";
import ListOrder from "~/scenes/FaceRegconite/ListOrder";
import ListCustomer_v2 from "~/scenes/FaceRegconite/ListCustomer_v2";
import ListCustomer_v3 from "~/scenes/FaceRegconite/ListCustomer_v3";
import FaceDetection from '~/scenes/Customer/FaceDetection';

const parentFaceRegconite = [
  {
    key: "face-regconite",
    name: "Face Regconite",
    component: FaceRegconite,
    path: "/face-regconite",
    template: "main",
    icon: <FontAwesomeIcon icon={faUserCircle} />,
    // permission: "check_required",
    permission:"hr-tool-face-regconite-list",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
    // exceptMajors: [64, 21],
  },
];
const childFaceRegconite = [
  {
    key: "list-log-debug",
    name: "Face Log Debug",
    component: ListCustomer,
    path: "/face-log-debug",
    template: "main",
    hide: true,
    // permission: "check_required",
    permission: "hr-tool-face-regconite-log-list",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
    // exceptMajors: [64, 21],
  },
  // {
  //   key: "list-log-debug-v2",
  //   name: "Face Log Debug V2",
  //   component: ListCustomer_v2,
  //   path: "/face-log-debug-v2",
  //   template: "main",
  //   hide: true,
  //   // permission: "check_required",
  //   permission: "hr-tool-face-regconite-log-list",
  //   // requiredManagerHigher: true,
  //   // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
  //   // exceptMajors: [64, 21],
  // },
  {
    key: "list-log-bad-face",
    name: "Face Bad",
    component: ListBadFace,
    path: "/bad-face",
    template: "main",
    hide: true,
    permission: "check_required",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
    // exceptMajors: [64, 21],
  },
  {
    key: "list-log-cashier",
    name: "Cashier",
    component: ListPerson,
    path: "/cashier",
    template: "main",
    hide: true,
    // permission: "check_required",
    permission: "hr-tool-face-regconite-cashier-list",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
    // exceptMajors: [64, 21],
  },
  {
    key: "list-log-order",
    name: "Order",
    component: ListOrder,
    path: "/order",
    template: "main",
    hide: true,
    // permission: "check_required",
    permission: "hr-tool-face-regconite-receipt-list",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
    // exceptMajors: [64, 21],
  },
  {
    key: "list-log-debug-v3",
    name: "Face Log Debug V3",
    component: ListCustomer_v3,
    path: "/face-log-debug-v3",
    template: "main",
    hide: true,
   
  },
  {
    key: 'customer.face-detect',
    name: 'Face Detection',
    component: FaceDetection,
    path: '/customer/face-detect',
    template: 'main',
    hide: true,
    //icon: <FontAwesomeIcon icon={faCameraRetro} />,
  },
]
export { parentFaceRegconite, childFaceRegconite };
