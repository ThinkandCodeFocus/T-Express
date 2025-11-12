"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import BlogItemNew from "@/components/Blog/BlogItemNew";
import { articleService } from "@/services/article.service";
import type { Article } from "@/types/api.types";

const BlogGridNew = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 9
  });

  useEffect(() => {
    loadArticles();
  }, [pagination.currentPage]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await articleService.getListe({
        per_page: pagination.perPage,
        page: pagination.currentPage
      });

      setArticles(response.data);
      setPagination(prev => ({
        ...prev,
        currentPage: response.meta.current_page,
        totalPages: response.meta.last_page,
        total: response.meta.total
      }));
    } catch (error) {
      console.error("Erreur chargement articles:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Blog"} pages={["blog"]} />
      
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
                {articles.map((article) => (
                  <BlogItemNew article={article} key={article.id} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-15">
                  <div className="bg-white shadow-1 rounded-md p-2">
                    <ul className="flex items-center">
                      <li>
                        <button
                          aria-label="Page précédente"
                          type="button"
                          disabled={pagination.currentPage === 1}
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] disabled:text-gray-4 hover:text-white hover:bg-blue"
                        >
                          <svg
                            className="fill-current"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125C12.8813 2.33437 12.8813 2.72812 12.6282 2.98125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187C12.4876 16.0312 12.347 16.1156 12.1782 16.1156Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </li>

                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }

                        return (
                          <li key={pageNum}>
                            <button
                              onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                              className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] ${
                                pagination.currentPage === pageNum
                                  ? 'bg-blue text-white'
                                  : 'hover:text-white hover:bg-blue'
                              }`}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}

                      {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                        <>
                          <li>
                            <span className="flex py-1.5 px-3.5">...</span>
                          </li>
                          <li>
                            <button
                              onClick={() => setPagination(prev => ({ ...prev, currentPage: pagination.totalPages }))}
                              className="flex py-1.5 px-3.5 duration-200 rounded-[3px] hover:text-white hover:bg-blue"
                            >
                              {pagination.totalPages}
                            </button>
                          </li>
                        </>
                      )}

                      <li>
                        <button
                          aria-label="Page suivante"
                          type="button"
                          disabled={pagination.currentPage === pagination.totalPages}
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4"
                        >
                          <svg
                            className="fill-current"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.27197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">Aucun article disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogGridNew;
