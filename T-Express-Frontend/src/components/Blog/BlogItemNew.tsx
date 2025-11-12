import React from "react";
import type { Article } from "@/types/api.types";
import Image from "next/image";
import Link from "next/link";

interface BlogItemNewProps {
  article: Article;
}

const BlogItemNew = ({ article }: BlogItemNewProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="shadow-1 bg-white rounded-xl px-4 sm:px-5 pt-5 pb-4">
      <Link href={`/blog/${article.slug}`} className="rounded-md overflow-hidden block">
        <Image
          src={article.image || '/images/blog/default-blog.jpg'}
          alt={article.titre}
          className="rounded-md w-full"
          width={330}
          height={210}
        />
      </Link>

      <div className="mt-5.5">
        <span className="flex items-center gap-3 mb-2.5">
          <span className="text-custom-sm">
            {formatDate(article.date_publication)}
          </span>

          {/* divider */}
          <span className="block w-px h-4 bg-gray-4"></span>

          <span className="text-custom-sm">
            {article.vues} Vues
          </span>

          {article.categorie && (
            <>
              <span className="block w-px h-4 bg-gray-4"></span>
              <Link
                href={`/blog?categorie=${article.categorie}`}
                className="text-custom-sm text-blue ease-out duration-200 hover:text-blue-dark"
              >
                {article.categorie}
              </Link>
            </>
          )}
        </span>

        <h2 className="font-medium text-dark text-lg sm:text-xl ease-out duration-200 mb-4 hover:text-blue">
          <Link href={`/blog/${article.slug}`}>{article.titre}</Link>
        </h2>

        {article.extrait && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {article.extrait}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Link
            href={`/blog/${article.slug}`}
            className="text-custom-sm inline-flex items-center gap-2 py-2 ease-out duration-200 hover:text-blue"
          >
            Lire plus
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.1023 4.10225C10.3219 3.88258 10.6781 3.88258 10.8977 4.10225L15.3977 8.60225C15.6174 8.82192 15.6174 9.17808 15.3977 9.39775L10.8977 13.8977C10.6781 14.1174 10.3219 14.1174 10.1023 13.8977C9.88258 13.6781 9.88258 13.3219 10.1023 13.1023L13.642 9.5625H3C2.68934 9.5625 2.4375 9.31066 2.4375 9C2.4375 8.68934 2.68934 8.4375 3 8.4375H13.642L10.1023 4.89775C9.88258 4.67808 9.88258 4.32192 10.1023 4.10225Z"
                fill=""
              />
            </svg>
          </Link>

          {article.commentaires_count > 0 && (
            <span className="text-xs text-gray-500">
              {article.commentaires_count} commentaire{article.commentaires_count > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogItemNew;
