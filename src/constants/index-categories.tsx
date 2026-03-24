import korean1 from "@/assets/image/korean1.png";
import math1 from "@/assets/image/math1.png";
import korean2 from "@/assets/image/korean2.png";
import math2 from "@/assets/image/math2.png";

export const IndexCategories = [
  {
    id: "korean1",
    title: "국어1",
    icon: <img src={korean1} className="h-[250px] w-auto" />,
    link: "/:levelId/category/korean1",
  },
  {
    id: "math1",
    title: "수학1",
    icon: <img src={math1} className="h-[250px] w-auto" />,
    link: "/:levelId/category/math1",
  },
  {
    id: "korean2",
    title: "국어2",
    icon: <img src={korean2} className="h-[250px] w-auto" />,
    link: "/:levelId/category/korean2",
  },
  {
    id: "math2",
    title: "수학2",
    icon: <img src={math2} className="h-[250px] w-auto" />,
    link: "/:levelId/category/math2",
  },
];
