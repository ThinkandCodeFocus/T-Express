"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { articleService } from "@/services/article.service";
import type { Article, CommentaireArticle } from "@/types/api.types";
import { useParams } from "next/navigation";

const BlogDetailsNew = () => {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [articlesRecents, setArticlesRecents] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentFormData, setCommentFormData] = useState({
    nom: '',
    email: '',
    commentaire: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (slug) {
      loadArticle();
      loadArticlesRecents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await articleService.getDetail(slug);
      setArticle(data);
    } catch (error) {
      console.error("Erreur chargement article:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadArticlesRecents = async () => {
    try {
      const data = await articleService.getRecents(5);
      setArticlesRecents(data);
    } catch (error) {
      console.error("Erreur chargement articles récents:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;

    try {
      setSubmittingComment(true);
      await articleService.ajouterCommentaire({
        article_id: article.id,
        ...commentFormData
      });
      
      alert("Commentaire ajouté avec succès! Il sera visible après approbation.");
      setCommentFormData({ nom: '', email: '', commentaire: '' });
    } catch (error) {
      console.error("Erreur ajout commentaire:", error);
      alert("Erreur lors de l'ajout du commentaire");
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title={"Chargement..."} pages={["blog"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[750px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="animate-pulse">
              <div className="bg-gray-300 h-96 rounded-lg mb-6"></div>
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Breadcrumb title={"Article non trouvé"} pages={["blog"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[750px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-dark mb-4">Article non trouvé</h2>
              <Link href="/blog" className="text-blue hover:text-blue-dark">
                Retour au blog
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={article.titre} pages={["blog", article.titre]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[750px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Article Image */}
          {article.image && (
            <div className="rounded-[10px] overflow-hidden mb-7.5">
              <Image
                className="rounded-[10px] w-full"
                src={article.image}
                alt={article.titre}
                width={750}
                height={477}
              />
            </div>
          )}

          {/* Article Meta */}
          <div>
            <span className="flex items-center gap-3 mb-4">
              <span className="ease-out duration-200">
                {formatDate(article.date_publication)}
              </span>

              <span className="block w-px h-4 bg-gray-4"></span>

              <span className="ease-out duration-200">
                {article.vues} Vues
              </span>

              {article.categorie && (
                <>
                  <span className="block w-px h-4 bg-gray-4"></span>
                  <Link
                    href={`/blog?categorie=${article.categorie}`}
                    className="text-blue ease-out duration-200 hover:text-blue-dark"
                  >
                    {article.categorie}
                  </Link>
                </>
              )}

              {article.commentaires_count > 0 && (
                <>
                  <span className="block w-px h-4 bg-gray-4"></span>
                  <span>{article.commentaires_count} commentaire{article.commentaires_count > 1 ? 's' : ''}</span>
                </>
              )}
            </span>

            {/* Article Title */}
            <h1 className="font-medium text-dark text-xl lg:text-2xl xl:text-custom-4xl mb-6">
              {article.titre}
            </h1>

            {/* Article Content */}
            <div
              className="prose prose-lg max-w-none mb-10"
              dangerouslySetInnerHTML={{ __html: article.contenu }}
            />

            {/* Author Info */}
            <div className="rounded-xl bg-white pt-7.5 pb-6 px-4 sm:px-7.5 my-7.5">
              <div className="flex items-center gap-4">
                <div className="flex w-16 h-16 rounded-full overflow-hidden bg-blue items-center justify-center">
                  <span className="text-white text-2xl font-medium">
                    {article.auteur.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-dark font-medium">{article.auteur}</h4>
                  <p className="text-sm text-gray-500">Auteur</p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {article.commentaires && article.commentaires.length > 0 && (
              <div className="mt-10">
                <h3 className="font-medium text-dark text-xl mb-6">
                  Commentaires ({article.commentaires.length})
                </h3>

                <div className="space-y-6">
                  {article.commentaires.map((commentaire) => (
                    <div key={commentaire.id} className="bg-white rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex w-12 h-12 rounded-full bg-gray-200 items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-medium">
                            {commentaire.nom.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-dark">{commentaire.nom}</h4>
                            <span className="text-xs text-gray-500">
                              {formatDate(commentaire.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700">{commentaire.commentaire}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment Form */}
            <div className="mt-10 bg-white rounded-lg p-6">
              <h3 className="font-medium text-dark text-xl mb-6">
                Laisser un commentaire
              </h3>

              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-dark mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="nom"
                      required
                      value={commentFormData.nom}
                      onChange={(e) => setCommentFormData(prev => ({ ...prev, nom: e.target.value }))}
                      className="w-full rounded-md border border-gray-3 bg-gray-1 py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={commentFormData.email}
                      onChange={(e) => setCommentFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-md border border-gray-3 bg-gray-1 py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="commentaire" className="block text-sm font-medium text-dark mb-2">
                    Commentaire *
                  </label>
                  <textarea
                    id="commentaire"
                    required
                    rows={5}
                    value={commentFormData.commentaire}
                    onChange={(e) => setCommentFormData(prev => ({ ...prev, commentaire: e.target.value }))}
                    className="w-full rounded-md border border-gray-3 bg-gray-1 py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingComment}
                  className="inline-flex font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
                >
                  {submittingComment ? 'Envoi en cours...' : 'Envoyer le commentaire'}
                </button>
              </form>
            </div>

            {/* Related Articles */}
            {articlesRecents.length > 0 && (
              <div className="mt-12">
                <h3 className="font-medium text-dark text-xl mb-6">
                  Articles récents
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {articlesRecents.slice(0, 2).map((art) => (
                    <Link
                      key={art.id}
                      href={`/blog/${art.slug}`}
                      className="bg-white rounded-lg overflow-hidden shadow-1 hover:shadow-2 transition-shadow"
                    >
                      {art.image && (
                        <Image
                          src={art.image}
                          alt={art.titre}
                          width={350}
                          height={200}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-medium text-dark mb-2 line-clamp-2">
                          {art.titre}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(art.date_publication)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetailsNew;
