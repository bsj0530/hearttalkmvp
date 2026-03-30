import korean1 from "@/assets/image/korean1.png";
import korean2 from "@/assets/image/korean2.png";
import korean3 from "@/assets/image/korean3.png";
import korean4 from "@/assets/image/korean4.png";

export const IndexCategories = [
  {
    id: "chapter1",
    title: "챕터1",
    icon: <img src={korean1} className="h-[250px] w-auto" />,
    link: "/:levelId/category/chapter1",
  },
  {
    id: "chapter2",
    title: "챕터2",
    icon: <img src={korean2} className="h-[250px] w-auto" />,
    link: "/:levelId/category/chapter2",
  },
  {
    id: "chapter3",
    title: "챕터3",
    icon: <img src={korean3} className="h-[250px] w-auto" />,
    link: "/:levelId/category/chapter3",
  },
  {
    id: "chapter4",
    title: "챕터4",
    icon: <img src={korean4} className="h-[250px] w-auto" />,
    link: "/:levelId/category/chapter4",
  },
];
