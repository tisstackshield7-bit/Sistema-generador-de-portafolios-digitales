import { useEffect, useState } from 'react'
import { useAuthStore } from '../context/authStore'
import { userService } from '../services'
import { Navbar, Card, Button, Input, LoadingSpinner } from '../components'
import { User, Mail, Briefcase, MapPin, Phone, Globe } from 'lucide-react'

export function ProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    professional_title: '',
    bio: '',
    avatar_url: '',
    location: '',
    phone: '',
    website: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await userService.getProfile()
      setProfile(data)
      setFormData({
        name: data.name || '',
        professional_title: data.professional_title || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
        location: data.location || '',
        phone: data.phone || '',
        website: data.website || '',
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await userService.updateProfile(formData)
      setProfile({ ...profile, ...formData })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark-900 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
            <Button
              variant={isEditing ? 'secondary' : 'primary'}
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>

          <Card>
            <div className="space-y-6">
              {/* Avatar */}
              {formData.avatar_url && (
                <div className="flex justify-center">
                  <img
                    src={formData.avatar_url}
                    alt={formData.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-500"
                  />
                </div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <Input
                    label="Título Profesional"
                    value={formData.professional_title}
                    onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
                  />

                  <div>
                    <label className="text-sm font-medium text-dark-200 block mb-2">
                      Biografía
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 focus:outline-none focus:border-primary-500"
                      rows="4"
                      placeholder="Cuéntanos sobre ti..."
                    />
                  </div>

                  <Input
                    label="Avatar URL"
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  />

                  <Input
                    label="Ubicación"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />

                  <Input
                    label="Teléfono"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />

                  <Input
                    label="Sitio Web"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-dark-400 text-sm">Nombre</p>
                      <p className="text-white font-medium">{profile?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-dark-400 text-sm">Email</p>
                      <p className="text-white font-medium">{profile?.email}</p>
                    </div>
                  </div>

                  {profile?.professional_title && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-dark-400 text-sm">Título Profesional</p>
                        <p className="text-white font-medium">{profile.professional_title}</p>
                      </div>
                    </div>
                  )}

                  {profile?.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-dark-400 text-sm">Ubicación</p>
                        <p className="text-white font-medium">{profile.location}</p>
                      </div>
                    </div>
                  )}

                  {profile?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-dark-400 text-sm">Teléfono</p>
                        <p className="text-white font-medium">{profile.phone}</p>
                      </div>
                    </div>
                  )}

                  {profile?.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-dark-400 text-sm">Sitio Web</p>
                        <p className="text-white font-medium">{profile.website}</p>
                      </div>
                    </div>
                  )}

                  {profile?.bio && (
                    <div>
                      <p className="text-dark-400 text-sm">Biografía</p>
                      <p className="text-white mt-1">{profile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
