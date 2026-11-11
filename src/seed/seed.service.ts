import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Actor } from '../actors/entities/actor.entity';
import { Category } from '../categories/entities/category.entity';
import { Event } from '../events/entities/event.entity';
import { Media } from '../media/entities/media.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Media) private readonly media: Repository<Media>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(Event) private readonly events: Repository<Event>,
    @InjectRepository(Actor) private readonly actors: Repository<Actor>,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const admin = await this.seedAdmin();
    const categories = await this.seedCategories();
    const media = await this.seedMedia();

    if (!admin || !categories) return;

    await this.seedPosts(admin, categories, media);
    await this.seedEvent();
    await this.seedActors();
  }

  private async seedAdmin(): Promise<User | null> {
    if ((await this.users.count()) > 0) {
      return this.users.findOneBy({ email: this.adminEmail() });
    }

    const password = this.config.get<string>(
      'ADMIN_PASSWORD',
      'Ciudades2026!',
    );
    const admin = this.users.create({
      name: 'Equipo de Comunicación',
      email: this.adminEmail(),
      passwordHash: await bcrypt.hash(password, 12),
      role: 'ADMIN',
      active: true,
      mustChangePassword: false,
    });
    await this.users.save(admin);
    this.logger.log(`Usuario administrador creado: ${admin.email}`);
    return admin;
  }

  private async seedCategories(): Promise<Map<string, Category> | null> {
    const existing = await this.categories.find();
    if (existing.length > 0) {
      return new Map(existing.map((category) => [category.slug, category]));
    }

    const definitions = [
      ['Programa', 'programa', 'Novedades del programa y sus ejes de trabajo.', '#1B6FD1'],
      ['Mesa de Enlace', 'mesa-de-enlace', 'Encuentros y avances de la Mesa de Enlace.', '#22B8E6'],
      ['Educación', 'educacion', 'Formación, talento y vinculación educativa.', '#2E7D5B'],
      ['Innovación', 'innovacion', 'Tecnología, proyectos e iniciativas.', '#7C3AED'],
      ['Economía del Conocimiento', 'economia-del-conocimiento', 'Marco normativo y oportunidades.', '#F7B733'],
      ['RIL', 'ril', 'Red de Innovación Local y experiencias de otras ciudades.', '#1557B0'],
      ['Agenda', 'agenda', 'Próximos encuentros y actividades.', '#E11D48'],
    ];

    const saved = await this.categories.save(
      definitions.map(([name, slug, description, color], index) =>
        this.categories.create({
          name,
          slug,
          description,
          color,
          order: index + 1,
        }),
      ),
    );

    return new Map(saved.map((category) => [category.slug, category]));
  }

  private async seedMedia(): Promise<Map<string, Media> | null> {
    if ((await this.media.count()) > 0) return null;

    const saved = await this.media.save([
      this.media.create({
        filename: 'invitacion-sector-privado.jpeg',
        originalName: 'Invitación al sector privado',
        mimeType: 'image/jpeg',
        size: 0,
        alt: 'Pieza de invitación al sector privado con fecha y lugar del encuentro',
        path: '/assets/images/invitacion-sector-privado.jpeg',
      }),
      this.media.create({
        filename: 'que-es-ciudades.jpeg',
        originalName: '¿Qué queremos lograr?',
        mimeType: 'image/jpeg',
        size: 0,
        alt: 'Pieza gráfica con los conceptos principales de Ciudades del Conocimiento',
        path: '/assets/images/que-es-ciudades.jpeg',
      }),
    ]);

    return new Map([
      ['invitacion', saved[0]],
      ['que-es', saved[1]],
    ]);
  }

  private async seedPosts(
    admin: User,
    categories: Map<string, Category>,
    media: Map<string, Media> | null,
  ): Promise<void> {
    if ((await this.posts.count()) > 0) return;

    const category = (slug: string) => categories.get(slug)!;
    const cover = (key: string) => media?.get(key)?.id ?? null;

    const definitions = [
      {
        title: 'Invitación al sector privado: encuentro el 16 de noviembre',
        slug: 'invitacion-al-sector-privado-encuentro-16-de-noviembre',
        excerpt:
          'La Municipalidad invita a empresas, emprendedores y representantes del sector privado a conocer el programa y participar de la Mesa de Enlace.',
        category: category('agenda'),
        featured: true,
        coverMediaId: cover('invitacion'),
        publishedAt: new Date('2026-11-10T12:00:00-03:00'),
        content: `La Municipalidad de Libertador General San Martín invita a empresas, emprendedores y representantes del sector privado a conocer el programa Ciudades del Conocimiento y participar en la construcción de la Mesa de Enlace.

El encuentro se realizará el lunes 16 de noviembre de 2026, a las 9:00, en el Salón Yapeyú. La convocatoria está abierta a empresas, PyMEs, emprendedores y referentes del sector productivo local.

Durante la jornada se presentarán los objetivos del programa, los cuatro pilares de trabajo y el espacio de la Mesa de Enlace. También se compartirán los primeros pasos para sumar proyectos y prioridades.

Para confirmar asistencia o pedir más información, escribinos desde la página de contacto.`,
      },
      {
        title: 'Ciudades del Conocimiento: qué es y por qué importa',
        slug: 'ciudades-del-conocimiento-que-es-y-por-que-importa',
        excerpt:
          'Una estrategia para impulsar el desarrollo local a partir del conocimiento, la tecnología y la articulación entre actores.',
        category: category('programa'),
        featured: true,
        coverMediaId: cover('que-es'),
        publishedAt: new Date('2026-11-08T10:00:00-03:00'),
        content: `Ciudades del Conocimiento es una estrategia para impulsar el desarrollo local con base en el conocimiento. Conecta instituciones educativas, empresas, gobierno y comunidad para ampliar las oportunidades de formación y trabajo, fortalecer la economía local y mejorar la calidad de vida.

No se limita al software ni requiere ser una gran capital. Se trata de reconocer los saberes que ya existen en la ciudad y ponerlos al servicio de proyectos concretos: formación, empleo, innovación y mejores servicios públicos.

El programa se enmarca en el enfoque de la Red de Innovación Local (RIL) y propone una agenda compartida entre el municipio, las instituciones educativas, el sector productivo y las organizaciones de la comunidad.

El objetivo es construir una ciudad más innovadora, conectada y con más oportunidades para quienes viven, estudian, trabajan y emprenden en Libertador General San Martín.`,
      },
      {
        title: 'Los cuatro pilares que sostienen el programa',
        slug: 'los-cuatro-pilares-que-sostienen-el-programa',
        excerpt:
          'Educación y talento, innovación y tecnología, desarrollo económico y articulación: los ejes que ordenan la estrategia.',
        category: category('programa'),
        featured: false,
        coverMediaId: null,
        publishedAt: new Date('2026-11-05T10:00:00-03:00'),
        content: `El programa se organiza en cuatro pilares que se complementan entre sí.

Educación y Talento: formación y capacidades para las personas. Incluye trayectorias educativas, capacitación técnica y habilidades digitales.

Innovación y Tecnología: soluciones y conocimiento aplicado. Busca que las ideas se transformen en proyectos, productos o mejoras concretas.

Desarrollo Económico: empleo y productividad. Apunta a fortalecer las actividades existentes y abrir nuevas oportunidades en la economía del conocimiento.

Articulación: Estado, empresas y academia trabajando juntos. Ningún actor puede solo; la Mesa de Enlace es el espacio para coordinar.

Los cuatro pilares se trabajan de manera integrada. Una acción de formación puede abrir una oportunidad de empleo; un proyecto de innovación puede mejorar un servicio municipal; una articulación puede destrabar una inversión.`,
      },
      {
        title: 'Mesa de Enlace: un espacio para construir agenda',
        slug: 'mesa-de-enlace-un-espacio-para-construir-agenda',
        excerpt:
          'El programa convoca a cuatro sectores para reconocer necesidades, acordar prioridades y definir proyectos.',
        category: category('mesa-de-enlace'),
        featured: false,
        coverMediaId: null,
        publishedAt: new Date('2026-11-03T10:00:00-03:00'),
        content: `La Mesa de Enlace es el espacio de participación de cuatro sectores: gobierno municipal, instituciones educativas, sector privado y organizaciones de la comunidad.

Su propósito es reconocer necesidades y capacidades, acordar prioridades y construir una agenda de proyectos con participación de los actores. No es un espacio para pedir recursos sin contraprestación: es un ámbito de trabajo conjunto, con compromisos y seguimiento.

El primer resultado propuesto es un mapa de instituciones y referentes, para preparar la convocatoria y evitar duplicar contactos. La agenda de la mesa se construye también con sus participantes.

Si querés sumarte, escribinos desde la página de contacto o participá del próximo encuentro.`,
      },
      {
        title: 'Ley 27.506: claves del régimen de Economía del Conocimiento',
        slug: 'ley-27-506-claves-del-regimen-de-economia-del-conocimiento',
        excerpt:
          'Qué actividades alcanza, qué incentivos contempla y por qué la adhesión provincial importa para la ciudad.',
        category: category('economia-del-conocimiento'),
        featured: false,
        coverMediaId: null,
        publishedAt: new Date('2026-10-28T10:00:00-03:00'),
        content: `La Ley Nacional 27.506 establece un régimen de promoción de la Economía del Conocimiento y fue modificada por la Ley 27.570. La provincia de Jujuy adhirió a través de la Ley Provincial 6.130.

El régimen alcanza, entre otras actividades, a software y servicios informáticos, producción audiovisual, biotecnología, nanotecnología, servicios geológicos y de prospección, servicios profesionales exportables e Industria 4.0. La elegibilidad depende de la actividad y de requisitos específicos.

Contempla beneficios generales sobre contribuciones patronales, impuesto a las ganancias y mecanismos vinculados a exportaciones, según la normativa vigente. No son beneficios automáticos por residir en una ciudad del conocimiento.

Esta información es general y no constituye asesoramiento impositivo. Antes de iniciar un trámite, consultá con un profesional y verificá los requisitos vigentes.`,
      },
      {
        title: 'RIL: la experiencia de Tandil y las lecciones para la ciudad',
        slug: 'ril-la-experiencia-de-tandil-y-las-lecciones-para-la-ciudad',
        excerpt:
          'Una ciudad intermedia que diversificó su economía a partir del talento, la universidad y la articulación.',
        category: category('ril'),
        featured: false,
        coverMediaId: null,
        publishedAt: new Date('2026-10-26T10:00:00-03:00'),
        content: `La Red de Innovación Local (RIL) impulsa capacidades y colaboración en gobiernos locales. El enfoque de Ciudades del Conocimiento busca fortalecer ecosistemas de innovación y talento, y la metodología y los criterios de certificación deben validarse con RIL.

Tandil es un caso inspirador. Ciudad intermedia con tradición agroindustrial, comercial y turística, incorporó progresivamente un sector tecnológico sin reemplazar su matriz productiva. La Universidad Nacional del Centro (UNICEN) formó talento, y la disponibilidad de graduados favoreció la radicación de empresas.

El Polo Informático, la cámara CEPIT, la Escuela de Talentos y FLAMA muestran que el desarrollo es acumulativo: formación, empresas, empleo y políticas locales se retroalimentan.

Cinco lecciones: formar talento, vincular actores, crear oportunidades, coordinar y medir. El desarrollo es un proceso sostenido, no un reconocimiento aislado.`,
      },
    ];

    for (const definition of definitions) {
      await this.posts.save(
        this.posts.create({
          title: definition.title,
          slug: definition.slug,
          excerpt: definition.excerpt,
          content: definition.content,
          status: 'PUBLISHED',
          featured: definition.featured,
          publishedAt: definition.publishedAt,
          coverMediaId: definition.coverMediaId,
          categoryId: definition.category.id,
          authorId: admin.id,
          seoTitle: definition.title,
          seoDescription: definition.excerpt,
        }),
      );
    }

    this.logger.log(`${definitions.length} novedades de ejemplo creadas`);
  }

  private async seedEvent(): Promise<void> {
    if ((await this.events.count()) > 0) return;

    await this.events.save(
      this.events.create({
        title: 'Encuentro con el sector privado',
        slug: 'encuentro-con-el-sector-privado',
        description:
          'Encuentro para conocer el programa Ciudades del Conocimiento y participar en la construcción de la Mesa de Enlace. Dirigido a empresas, emprendedores y representantes del sector privado.',
        startsAt: new Date('2026-11-16T09:00:00-03:00'),
        endsAt: null,
        place: 'Salón Yapeyú',
        ctaLabel: 'Confirmar asistencia',
        ctaUrl: '/contacto?motivo=mesa-de-enlace',
        published: true,
      }),
    );
  }

  private async seedActors(): Promise<void> {
    if ((await this.actors.count()) > 0) return;

    const demos = [
      ['Institución educativa de ejemplo', 'EDUCACION', 'Espacio de formación y vinculación con el programa.'],
      ['Empresa local de ejemplo', 'SECTOR_PRIVADO', 'Empresa de la ciudad interesada en sumarse a la Mesa de Enlace.'],
      ['Organización comunitaria de ejemplo', 'COMUNIDAD', 'Organización que trabaja con vecinos y vecinas.'],
    ];

    await this.actors.save([
      this.actors.create({
        name: 'Municipalidad de Libertador General San Martín',
        slug: 'municipalidad-libertador-general-san-martin',
        sector: 'GOBIERNO',
        description:
          'Área municipal que coordina el programa Ciudades del Conocimiento y acompaña la Mesa de Enlace.',
        published: true,
        consent: true,
        consentAt: new Date(),
        consentNote: 'Registro institucional del programa',
        order: 0,
      }),
      ...demos.map(([name, sector, description], index) =>
        this.actors.create({
          name,
          slug: `actor-ejemplo-${index + 1}`,
          sector,
          description,
          published: false,
          consent: false,
          consentAt: null,
          consentNote: null,
          order: index + 1,
        }),
      ),
    ]);
  }

  private adminEmail(): string {
    return this.config.get<string>('ADMIN_EMAIL', 'admin@ciudades.local').toLowerCase();
  }
}
