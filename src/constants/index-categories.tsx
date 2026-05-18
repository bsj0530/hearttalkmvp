import math1 from "@/assets/image/math1.png";
import math2 from "@/assets/image/math2.png";
import math3 from "@/assets/image/math3.png";
import math4 from "@/assets/image/math4.png";

export const IndexCategories = [
  {
    id: "chapter1",
    title: "챕터5",
    icon: <img src={math1} className="h-[250px] w-auto" />,
    link: "/:levelId/category/chapter1",
  },
  {
    id: "chapter2",
    title: "챕터6",
    icon: <img src={math2} className="h-[250px] w-auto" />,
    link: "/:levelId/category/chapter2",
  },
  {
    id: "chapter3",
    title: "챕터7",
    icon: <img src={math3} className="h-[250px] w-auto" />,
    link: "/:levelId/category/chapter3",
  },
  {
    id: "chapter4",
    title: "챕터8",
    icon: <img src={math4} className="h-[250px] w-auto" />,
    link: "/:levelId/category/chapter4",
  },
];
