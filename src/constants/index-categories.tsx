import school from "@/assets/image/free-icon-school-11149777.png";
import house from "@/assets/image/free-icon-house-10725576.png";
import publicPlace from "@/assets/image/free-icon-bus-17013510.png";
import book from "@/assets/image/free-icon-bus-17013510.png";

export const IndexCategories = [
  {
    id: "publicPlace",
    title: "공공장소",
    icon: <img src={publicPlace} className="h-[250px] w-auto" />,
    link: "/:levelId/category/help",
  },
  {
    id: "school",
    title: "학교생활",
    icon: <img src={school} className="h-[260px] w-auto" />,
    link: "/:levelId/category/school",
  },
  {
    id: "house",
    title: "가정생활",
    icon: <img src={house} className="h-[240px] w-auto" />,
    link: "/:levelId/category/play",
  },

  {
    id: "korean4",
    title: "국어4",
    icon: <img src={book} className="h-[250px] w-auto" />,
    link: "/:levelId/category/korean4",
  },
];
