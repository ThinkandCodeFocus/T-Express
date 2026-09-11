import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Testimonial } from "@/types/testimonial";

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="shadow-testimonial bg-white rounded-[10px] py-7.5 px-4 sm:px-8.5 m-1 h-full">
      <div className="flex items-center gap-1 mb-5" aria-label={`Note : ${testimonial.note} sur 5`}>
        {[1, 2, 3, 4, 5].map((etoile) => (
          <Image
            key={etoile}
            src="/images/icons/icon-star.svg"
            alt=""
            width={15}
            height={15}
            className={etoile <= testimonial.note ? "" : "opacity-25 grayscale"}
          />
        ))}
      </div>

      <p className="text-dark mb-6">{testimonial.commentaire}</p>

      <div className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="w-12.5 h-12.5 flex-shrink-0 rounded-full bg-blue-light-5 text-blue font-semibold text-lg flex items-center justify-center"
        >
          {testimonial.auteur.charAt(0).toUpperCase()}
        </div>

        <div>
          <h3 className="font-medium text-dark">{testimonial.auteur}</h3>
          <p className="text-custom-sm">
            A acheté{" "}
            <Link href={`/shop-details?id=${testimonial.produit.id}`} className="text-blue hover:underline">
              {testimonial.produit.nom}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
