import { Categorie } from "@/types/api.types";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const SingleItem = ({ item }: { item: Categorie }) => {
  // Utiliser l'image de la catégorie ou une image par défaut
  const imageUrl = item.image 
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${item.image}`
    : '/images/categories/default.png';

  return (
    <Link 
      href={`/shop-with-sidebar?categorie=${item.id}`} 
      className="group flex flex-col items-center"
    >
      <div className="max-w-[130px] w-full bg-[#F2F3F8] h-32.5 rounded-full flex items-center justify-center mb-4 relative">
        <Image 
          src={imageUrl} 
          alt={item.nom} 
          fill
          className="object-contain p-2"
          sizes="130px"
        />
      </div>

      <div className="flex justify-center">
        <h3 className="inline-block font-medium text-center text-dark bg-gradient-to-r from-blue to-blue bg-[length:0px_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_1px] group-hover:text-blue">
          {item.nom}
        </h3>
      </div>
    </Link>
  );
};

export default SingleItem;
