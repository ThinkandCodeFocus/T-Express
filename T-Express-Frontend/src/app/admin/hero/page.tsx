"use client";
import React, { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";
import Image from "next/image";

// Composant de carte pour afficher une section
const SectionCard = ({ section, onEdit, onDelete, onToggle, deleteId }: any) => (
  <div className={`border-2 rounded-xl p-4 transition-all ${section.actif ? 'border-green-3 bg-green-light-6' : 'border-gray-3 bg-gray-1'}`}>
    <div className="flex items-start gap-4 mb-4">
      <div className="flex-shrink-0">
        {section.image ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${section.image}`}
            alt={section.titre || "Hero"}
            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-3"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-2 rounded-lg flex items-center justify-center border-2 border-gray-3">
            <svg className="w-10 h-10 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-dark mb-1 truncate">{section.titre || 'Sans titre'}</h4>
        {section.description && (
          <p className="text-sm text-dark-4 line-clamp-2 mb-2">{section.description}</p>
        )}
        {section.position && (
          <span className="inline-block px-2 py-1 bg-blue-light-5 text-blue text-xs rounded mb-2">
            Position: {section.position}
          </span>
        )}
      </div>
    </div>
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={() => onToggle(section.id)}
        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
          section.actif 
            ? 'bg-green text-white hover:bg-green-dark' 
            : 'bg-gray-3 text-dark-4 hover:bg-gray-4'
        }`}
      >
        {section.actif ? '✓ Visible' : 'Masqué'}
      </button>
      <button
        onClick={() => onEdit(section)}
        className="flex-1 px-3 py-2 bg-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-dark transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Modifier
      </button>
      <button
        onClick={() => onDelete(section.id)}
        disabled={deleteId === section.id}
        className="px-3 py-2 bg-red text-white rounded-lg text-sm font-semibold hover:bg-red-dark transition-colors disabled:opacity-50"
      >
        {deleteId === section.id ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
    </div>
  </div>
);

interface HeroSection {
  id: number;
  type: 'carousel' | 'side_card' | 'promo_banner' | 'countdown';
  position: string | null;
  titre: string | null;
  description: string | null;
  sous_titre: string | null;
  pourcentage_reduction: number | null;
  texte_reduction: string | null;
  prix_actuel: number | null;
  prix_ancien: number | null;
  texte_prix: string | null;
  lien_url: string | null;
  texte_bouton: string | null;
  image: string | null;
  image_fond: string | null;
  image_produit: string | null;
  couleur_fond: string | null;
  date_fin_countdown: string | null;
  ordre: number;
  actif: boolean;
}

export default function AdminHero() {
  const [sections, setSections] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editSection, setEditSection] = useState<HeroSection | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageFondPreview, setImageFondPreview] = useState<string | null>(null);
  const [imageFond, setImageFond] = useState<File | null>(null);
  const [imageProduitPreview, setImageProduitPreview] = useState<string | null>(null);
  const [imageProduit, setImageProduit] = useState<File | null>(null);

  const [form, setForm] = useState<Partial<HeroSection & { [key: string]: any }>>({
    type: 'carousel',
    position: '',
    titre: '',
    description: '',
    sous_titre: '',
    pourcentage_reduction: null,
    texte_reduction: '',
    prix_actuel: null,
    prix_ancien: null,
    texte_prix: '',
    lien_url: '',
    texte_bouton: '',
    couleur_fond: '',
    date_fin_countdown: '',
    ordre: 0,
    actif: true,
  });

  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getHeroSections();
      setSections(data);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des sections hero.");
      toast.error(e.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const openModal = (section?: HeroSection, presetType?: string, presetPosition?: string) => {
    if (section) {
      setEditSection(section);
      setForm({
        type: section.type,
        position: section.position || '',
        titre: section.titre || '',
        description: section.description || '',
        sous_titre: section.sous_titre || '',
        pourcentage_reduction: section.pourcentage_reduction ?? null,
        texte_reduction: section.texte_reduction || '',
        prix_actuel: section.prix_actuel ?? null,
        prix_ancien: section.prix_ancien ?? null,
        texte_prix: section.texte_prix || '',
        lien_url: section.lien_url || '',
        texte_bouton: section.texte_bouton || '',
        couleur_fond: section.couleur_fond || '',
        date_fin_countdown: section.date_fin_countdown ? (section.date_fin_countdown.includes('T') ? section.date_fin_countdown.substring(0, 16) : section.date_fin_countdown + 'T00:00') : '',
        ordre: section.ordre ?? 0,
        actif: section.actif !== undefined ? section.actif : true,
      });
      if (section.image) {
        setImagePreview(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${section.image}`);
      }
      if (section.image_fond) {
        setImageFondPreview(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${section.image_fond}`);
      }
      if (section.image_produit) {
        setImageProduitPreview(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${section.image_produit}`);
      }
    } else {
      setEditSection(null);
      setForm({
        type: (presetType as 'carousel' | 'side_card' | 'promo_banner' | 'countdown') || 'carousel',
        position: presetPosition || '',
        titre: '',
        description: '',
        sous_titre: '',
        pourcentage_reduction: null,
        texte_reduction: '',
        prix_actuel: null,
        prix_ancien: null,
        texte_prix: '',
        lien_url: '',
        texte_bouton: '',
        couleur_fond: '',
        date_fin_countdown: '',
        ordre: 0,
        actif: true,
      });
      setImagePreview(null);
      setImage(null);
      setImageFondPreview(null);
      setImageFond(null);
      setImageProduitPreview(null);
      setImageProduit(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditSection(null);
    setImagePreview(null);
    setImage(null);
    setImageFondPreview(null);
    setImageFond(null);
    setImageProduitPreview(null);
    setImageProduit(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFondChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFond(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFondPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageProduitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageProduit(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageProduitPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // S'assurer que le type est toujours présent (requis)
      if (!form.type) {
        toast.error("Le type de section est requis");
        setSaving(false);
        return;
      }

      // Validation : Limiter à 2 éléments maximum pour side_card et petites bannières promo
      if (!editSection) {
        // Vérification uniquement lors de la création
        if (form.type === 'side_card') {
          const existingSideCards = sections.filter(s => s.type === 'side_card' && s.actif);
          if (existingSideCards.length >= 2) {
            toast.error("Vous ne pouvez avoir que 2 cartes latérales maximum. Veuillez supprimer une carte existante avant d'en ajouter une nouvelle.");
            setSaving(false);
            return;
          }
        }
        
        // Pour les petites bannières promo (promo_2 et promo_3)
        if (form.type === 'promo_banner' && (form.position === 'promo_2' || form.position === 'promo_3')) {
          const existingSmallPromos = sections.filter(s => 
            s.type === 'promo_banner' && 
            (s.position === 'promo_2' || s.position === 'promo_3') && 
            s.actif
          );
          if (existingSmallPromos.length >= 2) {
            toast.error("Vous ne pouvez avoir que 2 petites bannières promo maximum (promo_2 et promo_3). Veuillez supprimer une bannière existante avant d'en ajouter une nouvelle.");
            setSaving(false);
            return;
          }
          
          // Si la position n'est pas définie ou si elle est déjà prise, assigner automatiquement
          if (!form.position) {
            // Assigner promo_2 si disponible, sinon promo_3
            const hasPromo2 = existingSmallPromos.some(s => s.position === 'promo_2');
            const hasPromo3 = existingSmallPromos.some(s => s.position === 'promo_3');
            
            if (!hasPromo2) {
              form.position = 'promo_2';
            } else if (!hasPromo3) {
              form.position = 'promo_3';
            } else {
              toast.error("Les deux positions sont déjà occupées. Veuillez supprimer une bannière existante.");
              setSaving(false);
              return;
            }
          } else {
            // Vérifier si la position choisie est déjà prise
            const positionTaken = existingSmallPromos.some(s => s.position === form.position);
            if (positionTaken) {
              // Si la position est prise, assigner l'autre automatiquement
              if (form.position === 'promo_2') {
                form.position = 'promo_3';
              } else {
                form.position = 'promo_2';
              }
              
              // Vérifier à nouveau si l'autre position est aussi prise
              const otherPositionTaken = existingSmallPromos.some(s => s.position === form.position);
              if (otherPositionTaken) {
                toast.error("Les deux positions sont déjà occupées. Veuillez supprimer une bannière existante.");
                setSaving(false);
                return;
              }
            }
          }
        }
      }

      const data: any = {
        type: form.type,
        position: form.position || '',
        titre: form.titre || '',
        description: form.description || '',
        sous_titre: form.sous_titre || '',
        pourcentage_reduction: form.pourcentage_reduction ?? null,
        texte_reduction: form.texte_reduction || '',
        prix_actuel: form.prix_actuel ?? null,
        prix_ancien: form.prix_ancien ?? null,
        texte_prix: form.texte_prix || '',
        lien_url: form.lien_url || '',
        texte_bouton: form.texte_bouton || '',
        couleur_fond: form.couleur_fond || '',
        date_fin_countdown: form.date_fin_countdown || '',
        ordre: form.ordre ?? 0,
        actif: form.actif,
      };

      if (image) {
        data.image = image;
      }
      if (imageFond) {
        data.image_fond = imageFond;
      }
      if (imageProduit) {
        data.image_produit = imageProduit;
      }

      if (editSection) {
        await adminService.modifierHeroSection(editSection.id, data);
        toast.success("Section hero modifiée avec succès");
      } else {
        await adminService.creerHeroSection(data);
        toast.success("Section hero créée avec succès");
      }
      closeModal();
      fetchSections();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de cette section hero ?")) return;
    setDeleteId(id);
    try {
      await adminService.supprimerHeroSection(id);
      toast.success("Section hero supprimée avec succès");
      fetchSections();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActif = async (id: number) => {
    try {
      await adminService.toggleHeroSectionActif(id);
      toast.success("Statut modifié avec succès");
      fetchSections();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la modification.");
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      carousel: 'Carousel principal',
      side_card: 'Carte latérale',
      promo_banner: 'Bannière promo',
      countdown: 'Section Countdown',
    };
    return labels[type] || type;
  };

  const getTypeDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      carousel: 'Le grand carousel en haut de la page d\'accueil avec les images qui défilent',
      side_card: 'Les petites cartes à droite du carousel (ex: iPhone, Casque)',
      promo_banner: 'Les bannières promotionnelles en bas de la page',
      countdown: 'La section "Don\'t Miss" avec le compte à rebours',
    };
    return descriptions[type] || '';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'carousel') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    if (type === 'side_card') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    );
  };

  // Grouper les sections par type pour une meilleure organisation
  const sectionsByType = {
    carousel: sections.filter(s => s.type === 'carousel'),
    side_card: sections.filter(s => s.type === 'side_card'),
    promo_banner: sections.filter(s => s.type === 'promo_banner'),
    countdown: sections.filter(s => s.type === 'countdown'),
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">Gestion des sections Hero</h1>
            <p className="text-dark-4">Gérez les images et contenus de la page d&apos;accueil</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue to-blue-dark text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une section
          </button>
        </div>
      </div>

      {/* Organisation par type pour faciliter l'identification */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-light-5 border-t-blue rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-light-6 border-2 border-red-light-3 rounded-xl p-6 m-6">
          <p className="text-red-dark">{error}</p>
          <button onClick={fetchSections} className="mt-4 bg-red text-white px-4 py-2 rounded-lg">
            Réessayer
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Carousel Principal */}
          <div className="bg-white rounded-xl shadow-2 border border-gray-3 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-light-5 to-blue-light-4 px-6 py-4 border-b border-gray-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue rounded-lg flex items-center justify-center text-white">
                  {getTypeIcon('carousel')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-dark">Carousel Principal</h3>
                  <p className="text-sm text-dark-4">{getTypeDescription('carousel')}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {sectionsByType.carousel.length === 0 ? (
                <div className="text-center py-8 text-dark-4">
                  <p>Aucun carousel créé. Cliquez sur &quot;Ajouter une section&quot; et choisissez &quot;Carousel&quot;.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionsByType.carousel.map((section) => (
                    <SectionCard key={section.id} section={section} onEdit={openModal} onDelete={handleDelete} onToggle={handleToggleActif} deleteId={deleteId} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cartes Latérales */}
          <div className="bg-white rounded-xl shadow-2 border border-gray-3 overflow-hidden">
            <div className="bg-gradient-to-r from-green-light-5 to-green-light-4 px-6 py-4 border-b border-gray-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green rounded-lg flex items-center justify-center text-white">
                  {getTypeIcon('side_card')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-dark">Cartes Latérales</h3>
                  <p className="text-sm text-dark-4">{getTypeDescription('side_card')}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {sectionsByType.side_card.length === 0 ? (
                <div className="text-center py-8 text-dark-4">
                  <p>Aucune carte latérale créée. Cliquez sur &quot;Ajouter une section&quot; et choisissez &quot;Carte latérale&quot;.</p>
                  <p className="text-xs mt-2 text-orange font-semibold">⚠️ Maximum 2 cartes latérales autorisées</p>
                </div>
              ) : (
                <>
                  {sectionsByType.side_card.length >= 2 && (
                    <div className="mb-4 p-3 bg-orange-light-6 border border-orange rounded-lg">
                      <p className="text-sm text-orange font-semibold">
                        ⚠️ Limite atteinte : Vous avez déjà 2 cartes latérales. Supprimez-en une pour en ajouter une nouvelle.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionsByType.side_card.map((section) => (
                      <SectionCard key={section.id} section={section} onEdit={openModal} onDelete={handleDelete} onToggle={handleToggleActif} deleteId={deleteId} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Grande Bannière Promo */}
          <div className="bg-white rounded-xl shadow-2 border border-gray-3 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-light-5 to-orange-light-4 px-6 py-4 border-b border-gray-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange rounded-lg flex items-center justify-center text-white">
                    {getTypeIcon('promo_banner')}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark">Grande Bannière Promo</h3>
                    <p className="text-sm text-dark-4">La grande bannière promotionnelle en haut (promo_1)</p>
                  </div>
                </div>
                <button
                  onClick={() => openModal(undefined, 'promo_banner', 'promo_1')}
                  className="bg-orange text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-dark transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter
                </button>
              </div>
            </div>
            <div className="p-6">
              {sectionsByType.promo_banner.filter(s => s.position === 'promo_1').length === 0 ? (
                <div className="text-center py-8 text-dark-4">
                  <p>Aucune grande bannière promo créée. Cliquez sur &quot;Ajouter&quot; ci-dessus.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionsByType.promo_banner.filter(s => s.position === 'promo_1').map((section) => (
                    <SectionCard key={section.id} section={section} onEdit={openModal} onDelete={handleDelete} onToggle={handleToggleActif} deleteId={deleteId} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Petites Bannières Promo */}
          <div className="bg-white rounded-xl shadow-2 border border-gray-3 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-light-5 to-teal-light-4 px-6 py-4 border-b border-gray-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal rounded-lg flex items-center justify-center text-white">
                    {getTypeIcon('promo_banner')}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark">Petites Bannières Promo</h3>
                    <p className="text-sm text-dark-4">Les deux petites bannières côte à côte (promo_2 et promo_3) - Max 2</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Détecter automatiquement la position disponible
                    const existingSmallPromos = sectionsByType.promo_banner.filter(s => 
                      (s.position === 'promo_2' || s.position === 'promo_3') && s.actif
                    );
                    let autoPosition = 'promo_2'; // Par défaut, première position (gauche)
                    
                    // Si promo_2 existe déjà, utiliser promo_3
                    if (existingSmallPromos.some(s => s.position === 'promo_2')) {
                      autoPosition = 'promo_3';
                    }
                    
                    openModal(undefined, 'promo_banner', autoPosition);
                  }}
                  className="bg-teal text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-dark transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={sectionsByType.promo_banner.filter(s => (s.position === 'promo_2' || s.position === 'promo_3') && s.actif).length >= 2}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter
                </button>
              </div>
            </div>
            <div className="p-6">
              {sectionsByType.promo_banner.filter(s => s.position === 'promo_2' || s.position === 'promo_3').length === 0 ? (
                <div className="text-center py-8 text-dark-4">
                  <p>Aucune petite bannière promo créée. Cliquez sur &quot;Ajouter&quot; ci-dessus.</p>
                  <p className="text-xs mt-2 text-teal font-semibold">⚠️ Maximum 2 petites bannières autorisées</p>
                </div>
              ) : (
                <>
                  {sectionsByType.promo_banner.filter(s => (s.position === 'promo_2' || s.position === 'promo_3') && s.actif).length >= 2 && (
                    <div className="mb-4 p-3 bg-teal-light-6 border border-teal rounded-lg">
                      <p className="text-sm text-teal font-semibold">
                        ⚠️ Limite atteinte : Vous avez déjà 2 petites bannières promo actives. Supprimez-en une pour en ajouter une nouvelle.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionsByType.promo_banner.filter(s => s.position === 'promo_2' || s.position === 'promo_3').map((section) => (
                      <SectionCard key={section.id} section={section} onEdit={openModal} onDelete={handleDelete} onToggle={handleToggleActif} deleteId={deleteId} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section Countdown */}
          <div className="bg-white rounded-xl shadow-2 border border-gray-3 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-light-5 to-purple-light-4 px-6 py-4 border-b border-gray-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple rounded-lg flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-dark">Section Countdown</h3>
                  <p className="text-sm text-dark-4">{getTypeDescription('countdown')}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {sectionsByType.countdown.length === 0 ? (
                <div className="text-center py-8 text-dark-4">
                  <p>Aucune section countdown créée. Cliquez sur &quot;Ajouter une section&quot; et choisissez &quot;Section Countdown&quot;.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionsByType.countdown.map((section) => (
                    <SectionCard key={section.id} section={section} onEdit={openModal} onDelete={handleDelete} onToggle={handleToggleActif} deleteId={deleteId} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-3 w-full max-w-4xl my-8 relative max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-3 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-dark">
                {editSection ? "Modifier la section hero" : "Ajouter une section hero"}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-1 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Section: Type et Position */}
              <div className="bg-blue-light-6 rounded-lg p-4 border border-blue-light-3">
                <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Type de section
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Type de section <span className="text-red">*</span>
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                    >
                      <option value="carousel">🔄 Carousel Principal (Images qui défilent en haut)</option>
                      <option value="side_card">📱 Carte Latérale (Petites cartes à droite)</option>
                      <option value="promo_banner">🎯 Bannière Promo (Bannières promotionnelles)</option>
                      <option value="countdown">⏰ Section Countdown (Don&apos;t Miss avec compte à rebours)</option>
                    </select>
                    <p className="text-xs text-dark-4 mt-1">Choisissez où cette section apparaîtra sur la page d&apos;accueil</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">Position dans la liste</label>
                    {form.type === 'side_card' ? (
                      <select
                        name="position"
                        value={form.position}
                        onChange={handleChange}
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                      >
                        <option value="">Sélectionner une position</option>
                        <option value="side_1">side_1 (Première carte latérale)</option>
                        <option value="side_2">side_2 (Deuxième carte latérale)</option>
                      </select>
                    ) : form.type === 'promo_banner' ? (
                      <select
                        name="position"
                        value={form.position}
                        onChange={handleChange}
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        required
                      >
                        <option value="">Sélectionner une position</option>
                        {!editSection && (
                          <>
                            <option value="promo_1">promo_1 (Grande bannière promo en haut)</option>
                            <option value="promo_2">promo_2 (Petite bannière promo - gauche) - Max 2</option>
                            <option value="promo_3">promo_3 (Petite bannière promo - droite) - Max 2</option>
                          </>
                        )}
                        {editSection && (
                          <>
                            <option value="promo_1">promo_1 (Grande bannière promo en haut)</option>
                            <option value="promo_2">promo_2 (Petite bannière promo - gauche)</option>
                            <option value="promo_3">promo_3 (Petite bannière promo - droite)</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="position"
                        value={form.position}
                        onChange={handleChange}
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="Ex: main"
                      />
                    )}
                    <p className="text-xs text-dark-4 mt-1">
                      {form.type === 'side_card' 
                        ? '⚠️ Maximum 2 cartes latérales autorisées. Si 2 cartes existent déjà, supprimez-en une avant d\'en ajouter.'
                        : form.type === 'promo_banner'
                        ? '⚠️ Maximum 2 petites bannières (promo_2 et promo_3) autorisées. Si 2 bannières existent déjà, supprimez-en une avant d\'en ajouter.'
                        : 'Position optionnelle pour cette section'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section: Image */}
              <div className="bg-green-light-6 rounded-lg p-4 border border-green-light-3">
                <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Image de la section
                </h3>
                <div className="border-2 border-dashed border-gray-3 rounded-lg p-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full max-w-md h-64 object-contain rounded-lg mb-4 mx-auto" />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red text-white p-2 rounded-full hover:bg-red-dark"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-4 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-dark-4 mb-2">Aucune image sélectionnée</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="hero-image"
                  />
                  <label
                    htmlFor="hero-image"
                    className="block text-center px-6 py-3 bg-blue text-white rounded-lg cursor-pointer hover:bg-blue-dark transition-colors font-semibold"
                  >
                    {imagePreview ? '📷 Changer l\'image' : '📷 Choisir une image'}
                  </label>
                  <p className="text-xs text-dark-4 mt-2 text-center">Formats acceptés: JPG, PNG, GIF, WebP (max 5MB)</p>
                  <p className="text-xs text-blue mt-2 text-center font-semibold">💡 Si vous ajoutez une image, elle remplacera l&apos;image par défaut</p>
                </div>
              </div>

              {/* Section: Images supplémentaires (pour countdown et autres) */}
              {(form.type === 'countdown' || form.type === 'carousel') && (
                <div className="bg-teal-light-6 rounded-lg p-4 border border-teal-light-3">
                  <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Images de fond et produit
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image de fond */}
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Image de fond (bg shapes)
                      </label>
                      <div className="border-2 border-dashed border-gray-3 rounded-lg p-4">
                        {imageFondPreview ? (
                          <div className="relative mb-2">
                            <img src={imageFondPreview} alt="Preview fond" className="w-full h-32 object-contain rounded-lg" />
                            <button
                              type="button"
                              onClick={() => {
                                setImageFond(null);
                                setImageFondPreview(null);
                              }}
                              className="absolute top-1 right-1 bg-red text-white p-1 rounded-full"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <svg className="w-12 h-12 mx-auto text-gray-4 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFondChange}
                          className="hidden"
                          id="hero-image-fond"
                        />
                        <label
                          htmlFor="hero-image-fond"
                          className="block text-center px-4 py-2 bg-teal text-white rounded-lg cursor-pointer hover:bg-teal-dark text-sm"
                        >
                          {imageFondPreview ? 'Changer' : 'Choisir image de fond'}
                        </label>
                      </div>
                      <p className="text-xs text-dark-4 mt-1">Image de fond décorative (remplace l&apos;image par défaut si ajoutée)</p>
                    </div>

                    {/* Image produit */}
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Image produit
                      </label>
                      <div className="border-2 border-dashed border-gray-3 rounded-lg p-4">
                        {imageProduitPreview ? (
                          <div className="relative mb-2">
                            <img src={imageProduitPreview} alt="Preview produit" className="w-full h-32 object-contain rounded-lg" />
                            <button
                              type="button"
                              onClick={() => {
                                setImageProduit(null);
                                setImageProduitPreview(null);
                              }}
                              className="absolute top-1 right-1 bg-red text-white p-1 rounded-full"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <svg className="w-12 h-12 mx-auto text-gray-4 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageProduitChange}
                          className="hidden"
                          id="hero-image-produit"
                        />
                        <label
                          htmlFor="hero-image-produit"
                          className="block text-center px-4 py-2 bg-teal text-white rounded-lg cursor-pointer hover:bg-teal-dark text-sm"
                        >
                          {imageProduitPreview ? 'Changer' : 'Choisir image produit'}
                        </label>
                      </div>
                      <p className="text-xs text-dark-4 mt-1">Image du produit (pour countdown, remplace l&apos;image par défaut si ajoutée)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Date countdown (uniquement pour countdown) */}
              {form.type === 'countdown' && (
                <div className="bg-purple-light-6 rounded-lg p-4 border border-purple-light-3">
                  <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Date de fin du compte à rebours
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Date et heure de fin
                    </label>
                    <input
                      type="datetime-local"
                      name="date_fin_countdown"
                      value={form.date_fin_countdown}
                      onChange={handleChange}
                      className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                    />
                    <p className="text-xs text-dark-4 mt-1">La date jusqu&apos;à laquelle le compte à rebours doit compter. Si non rempli, une date par défaut sera utilisée.</p>
                  </div>
                </div>
              )}

              {/* Section: Textes - Affichage conditionnel selon le type */}
              {(form.type === 'carousel' || form.type === 'side_card' || form.type === 'promo_banner' || form.type === 'countdown') && (
                <div className="bg-purple-light-6 rounded-lg p-4 border border-purple-light-3">
                  <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Textes et descriptions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Titre principal - pour tous sauf countdown (qui utilise sous_titre pour "Don't Miss") */}
                    {(form.type === 'carousel' || form.type === 'side_card' || form.type === 'promo_banner') && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-dark mb-2">
                          Titre principal
                        </label>
                        <input
                          type="text"
                          name="titre"
                          value={form.titre}
                          onChange={handleChange}
                          className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                          placeholder={form.type === 'promo_banner' ? "Ex: Workout At Home" : "Ex: iPhone 14 Plus & 14 Pro Max"}
                        />
                        <p className="text-xs text-dark-4 mt-1">Le titre principal qui s&apos;affichera en grand</p>
                      </div>
                    )}

                    {/* Sous-titre - pour countdown (Don't Miss) et promo_banner */}
                    {(form.type === 'countdown' || form.type === 'promo_banner' || form.type === 'side_card') && (
                      <div>
                        <label className="block text-sm font-semibold text-dark mb-2">
                          {form.type === 'countdown' ? 'Texte "Don\'t Miss" (sous-titre)' : 'Sous-titre'}
                        </label>
                        <input
                          type="text"
                          name="sous_titre"
                          value={form.sous_titre}
                          onChange={handleChange}
                          className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                          placeholder={form.type === 'countdown' ? "Ex: Don't Miss!!" : form.type === 'promo_banner' ? "Ex: Foldable Motorised Treadmill" : "Ex: Sale Off"}
                        />
                        <p className="text-xs text-dark-4 mt-1">
                          {form.type === 'countdown' 
                            ? 'Le texte qui apparaît en haut (ex: "Don\'t Miss!!")'
                            : form.type === 'promo_banner'
                            ? 'Le texte qui apparaît au-dessus du titre (ex: "Foldable Motorised Treadmill")'
                            : 'Un sous-titre optionnel (petit texte au-dessus du titre)'}
                        </p>
                      </div>
                    )}

                    {/* Titre pour countdown */}
                    {form.type === 'countdown' && (
                      <div>
                        <label className="block text-sm font-semibold text-dark mb-2">
                          Titre principal
                        </label>
                        <input
                          type="text"
                          name="titre"
                          value={form.titre}
                          onChange={handleChange}
                          className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                          placeholder="Ex: Enhance Your Music Experience"
                        />
                        <p className="text-xs text-dark-4 mt-1">Le titre principal de la section</p>
                      </div>
                    )}

                    {/* Description - pour tous */}
                    <div className={form.type === 'countdown' ? 'md:col-span-2' : 'md:col-span-2'}>
                      <label className="block text-sm font-semibold text-dark mb-2">Description</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={form.type === 'countdown' ? 3 : 4}
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder={form.type === 'countdown' ? "Ex: The Havit H206d is a wired PC headphone." : "Décrivez votre produit ou promotion..."}
                      />
                      <p className="text-xs text-dark-4 mt-1">
                        {form.type === 'countdown' 
                          ? 'La description qui apparaît sous le titre'
                          : 'Une description détaillée qui apparaîtra sous le titre'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Promotion - Pour carousel */}
              {form.type === 'carousel' && (
                <div className="bg-orange-light-6 rounded-lg p-4 border border-orange-light-3">
                  <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Promotion (Pourcentage et texte de réduction)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Pourcentage de réduction</label>
                      <input
                        type="number"
                        name="pourcentage_reduction"
                        value={form.pourcentage_reduction}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="30"
                      />
                      <p className="text-xs text-dark-4 mt-1">Ex: 30 pour afficher &quot;30%&quot; (le grand nombre bleu à gauche)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Texte de réduction</label>
                      <input
                        type="text"
                        name="texte_reduction"
                        value={form.texte_reduction}
                        onChange={handleChange}
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="Sale\nOff"
                      />
                      <p className="text-xs text-dark-4 mt-1">Le texte qui apparaît à côté du pourcentage (ex: &quot;Sale\nOff&quot; pour deux lignes, ou &quot;20% off&quot;)</p>
                      <p className="text-xs text-orange mt-1">💡 Utilisez \n pour créer un saut de ligne (ex: &quot;Sale\nOff&quot;)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Promotion et Prix - Uniquement pour side_card */}
              {form.type === 'side_card' && (
                <div className="bg-orange-light-6 rounded-lg p-4 border border-orange-light-3">
                  <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Prix et réduction
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Prix actuel (en FCFA)</label>
                      <input
                        type="number"
                        name="prix_actuel"
                        value={form.prix_actuel}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="420000"
                      />
                      <p className="text-xs text-dark-4 mt-1">Le prix de vente actuel (sans espaces ni virgules)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Prix ancien (en FCFA)</label>
                      <input
                        type="number"
                        name="prix_ancien"
                        value={form.prix_ancien}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="600000"
                      />
                      <p className="text-xs text-dark-4 mt-1">L&apos;ancien prix barré pour montrer la réduction</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Pourcentage de réduction</label>
                      <input
                        type="number"
                        name="pourcentage_reduction"
                        value={form.pourcentage_reduction}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="30"
                      />
                      <p className="text-xs text-dark-4 mt-1">Ex: 30 pour afficher &quot;30%&quot;</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Texte au-dessus du prix</label>
                      <input
                        type="text"
                        name="texte_prix"
                        value={form.texte_prix}
                        onChange={handleChange}
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="Ex: Offre limitée"
                      />
                      <p className="text-xs text-dark-4 mt-1">Un petit texte qui apparaît au-dessus des prix</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Promotion - Uniquement pour promo_banner */}
              {form.type === 'promo_banner' && (
                <div className="bg-orange-light-6 rounded-lg p-4 border border-orange-light-3">
                  <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Promotion
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Texte de réduction</label>
                      <input
                        type="text"
                        name="texte_reduction"
                        value={form.texte_reduction}
                        onChange={handleChange}
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="Ex: Flat 20% off"
                      />
                      <p className="text-xs text-dark-4 mt-1">Le texte de réduction qui apparaît (ex: &quot;Flat 20% off&quot;)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Pourcentage de réduction</label>
                      <input
                        type="number"
                        name="pourcentage_reduction"
                        value={form.pourcentage_reduction}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="20"
                      />
                      <p className="text-xs text-dark-4 mt-1">Ex: 20 pour afficher &quot;20%&quot; (optionnel si vous utilisez le texte de réduction)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Bouton et Lien - Pour tous sauf countdown (qui a son propre champ) */}
              {(form.type === 'carousel' || form.type === 'side_card' || form.type === 'promo_banner') && (
                <div className="bg-teal-light-6 rounded-lg p-4 border border-teal-light-3">
                  <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Bouton et lien
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Texte du bouton</label>
                      <input
                        type="text"
                        name="texte_bouton"
                        value={form.texte_bouton}
                        onChange={handleChange}
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder={form.type === 'promo_banner' ? "Ex: Grab Now" : "Ex: Shop Now, Buy Now"}
                      />
                      <p className="text-xs text-dark-4 mt-1">Le texte qui apparaît sur le bouton</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Lien URL (adresse web)</label>
                      <input
                        type="url"
                        name="lien_url"
                        value={form.lien_url}
                        onChange={handleChange}
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="https://votresite.com/produit ou /shop"
                      />
                      <p className="text-xs text-dark-4 mt-1">Où le bouton redirige quand on clique dessus</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Bouton pour countdown */}
              {form.type === 'countdown' && (
                <div className="bg-teal-light-6 rounded-lg p-4 border border-teal-light-3">
                  <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Bouton
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Texte du bouton</label>
                      <input
                        type="text"
                        name="texte_bouton"
                        value={form.texte_bouton}
                        onChange={handleChange}
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="Ex: Check it Out!"
                      />
                      <p className="text-xs text-dark-4 mt-1">Le texte qui apparaît sur le bouton</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Lien URL (adresse web)</label>
                      <input
                        type="url"
                        name="lien_url"
                        value={form.lien_url}
                        onChange={handleChange}
                        className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                        placeholder="https://votresite.com/produit ou /shop"
                      />
                      <p className="text-xs text-dark-4 mt-1">Où le bouton redirige quand on clique dessus</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Options avancées */}
              <div className="bg-gray-1 rounded-lg p-4 border border-gray-3">
                <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-dark-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Options avancées
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Couleur de fond - uniquement pour promo_banner */}
                  {form.type === 'promo_banner' && (
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">Couleur de fond (code couleur)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={form.couleur_fond || '#F5F5F7'}
                          onChange={(e) => setForm({...form, couleur_fond: e.target.value})}
                          className="w-16 h-12 border border-gray-3 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          name="couleur_fond"
                          value={form.couleur_fond}
                          onChange={handleChange}
                          className="flex-1 border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                          placeholder="#F5F5F7"
                        />
                      </div>
                      <p className="text-xs text-dark-4 mt-1">Choisissez une couleur de fond pour la bannière</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">Ordre d&apos;affichage</label>
                    <input
                      type="number"
                      name="ordre"
                      value={form.ordre}
                      onChange={handleChange}
                      min="0"
                      className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                      placeholder="0"
                    />
                    <p className="text-xs text-dark-4 mt-1">Plus le nombre est petit, plus la section apparaît en premier</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-gray-3 hover:bg-gray-1">
                      <input
                        type="checkbox"
                        name="actif"
                        checked={form.actif}
                        onChange={handleChange}
                        className="w-6 h-6 text-blue rounded focus:ring-2 focus:ring-blue"
                      />
                      <div>
                        <span className="text-dark font-semibold block">Afficher cette section sur le site</span>
                        <span className="text-xs text-dark-4">Si décoché, la section sera masquée mais pas supprimée</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-3 rounded-lg font-medium hover:bg-gray-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue to-blue-dark text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? "Enregistrement..." : editSection ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

