import { Test, TestingModule } from "@nestjs/testing";
import { StoriesService } from "./stories.service";
import { User } from "../../entities/users.entity";
import { Story } from "../../entities/stories.entity";
import { TopicsEnum } from "./common/enums/topics.enum";
import { UsersService } from "../users/users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FilesService } from "../../packages/files/files.service";
import { Equal } from "typeorm";
import { StoriesErrorsEnum } from "./common/enums/stories.enum";
import { EditStoryDto } from "./common/dto/edit-story.dto";
import { MAX_STORY_FILES } from "../../common/configs/static.config";

describe("StoriesService", () => {
  let service: StoriesService;

  const mockUser: User = {
    id: 1,
    name: "Test",
    password: "123hashed",
    stories: [],
  };

  const mockFiles = "dfgjkdfgk.jpg, sdfgsdg.png";
  const mockArrayFilesWithUrl = ["https://localhost/static/dfgjkdfgk.jpg", "https://localhost/static/sdfgsdg.png"];

  const mockStories: Story[] = [
    {
      id: 1,
      date: "2025-11-10",
      files: mockFiles,
      title: "Story",
      description: "Story description",
      text: "Text story",
      topic: TopicsEnum.NARRATIVE,
      user: mockUser,
    },
    {
      id: 2,
      date: "2025-11-10",
      files: mockFiles,
      title: "Story",
      description: "Story description",
      text: "Text story",
      topic: TopicsEnum.HORROR,
      user: mockUser,
    },
    {
      id: 3,
      date: "2025-11-10",
      files: mockFiles,
      title: "Story",
      description: "Story description",
      text: "Text story",
      topic: TopicsEnum.ADVENTURE,
      user: mockUser,
    },
    {
      id: 4,
      date: "2025-11-10",
      files: mockFiles,
      title: "Story",
      description: "Story description",
      text: "Text story",
      topic: TopicsEnum.HORROR,
      user: mockUser,
    },
  ];

  const mockStoriesRepository = {
    find: jest.fn().mockResolvedValue(mockStories),
    findOne: jest.fn().mockResolvedValue(mockStories[0]),
    create: jest.fn().mockReturnValue(mockStories[0]),
    save: jest.fn().mockResolvedValue(mockStories[0]),
    remove: jest.fn().mockResolvedValue(mockStories[0]),
  };
  const mockUserService = {
    getSelectSafetyUserData: jest.fn(() => ({ id: true, name: true })),
  };

  const mockFilesService = {
    parseFilenamesFromString: jest.fn((filenamesString: string) => (filenamesString.length > 0 ? filenamesString.split(", ") : [])),
    concatUrlWithFiles: jest.fn().mockReturnValue(mockArrayFilesWithUrl),
    saveFilesAndGetString: jest.fn().mockReturnValue(mockFiles),
    processFilesUpdate: jest.fn().mockReturnValue(mockFiles),
    deleteFiles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoriesService,
        { provide: getRepositoryToken(Story), useValue: mockStoriesRepository },
        { provide: UsersService, useValue: mockUserService },
        { provide: FilesService, useValue: mockFilesService },
      ],
    }).compile();

    service = module.get<StoriesService>(StoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // getStories method
  it("should get stories with default parameters", async () => {
    const expectedResult = mockStories.map(story => ({ ...story, files: mockArrayFilesWithUrl }));

    expect(await service.getStories()).toEqual(expectedResult);
  });

  it("should get stories with parameters", async () => {
    const horrorStories = mockStories.filter(story => story.topic === TopicsEnum.HORROR);
    const expectedResult = horrorStories.map(story => ({ ...story, files: mockArrayFilesWithUrl }));
    const page = 5;
    const take = 10;

    mockStoriesRepository.find.mockResolvedValueOnce(horrorStories);

    expect(await service.getStories(page, take, TopicsEnum.HORROR)).toEqual(expectedResult);

    expect(mockStoriesRepository.find).toHaveBeenLastCalledWith(expect.objectContaining({ where: { topic: Equal(TopicsEnum.HORROR) }, skip: (page - 1) * take, take }));
  });

  // getStoryById method
  it("should throw not found exception", () => {
    mockStoriesRepository.findOne.mockResolvedValueOnce(null);

    expect(service.getStoryById(324)).rejects.toThrowError(StoriesErrorsEnum.NOT_FOUND_STORY);
  });

  it("should get story", async () => {
    const expectedResult = { ...mockStories[0], files: mockArrayFilesWithUrl, filenames: mockFiles.split(", ") };

    expect(await service.getStoryById(1)).toEqual(expectedResult);
  });

  // createStory method
  it("should create a story", async () => {
    expect(await service.createStory(mockStories[0], mockUser, [])).toEqual(mockStories[0]);
  });

  // editStory method
  it("should throw not found exception", () => {
    mockStoriesRepository.findOne.mockResolvedValueOnce(null);

    expect(service.editStory({ id: 123 } as EditStoryDto, mockUser)).rejects.toThrowError(StoriesErrorsEnum.NOT_FOUND_STORY);
  });

  it("should throw forbidden exception (check ownership)", () => {
    expect(service.editStory({ id: 1 } as EditStoryDto, { ...mockUser, id: 2 })).rejects.toThrowError(StoriesErrorsEnum.DONT_HAVE_ACCESS);
  });

  it("should edit story", async () => {
    const editedStory = { ...mockStories[0], title: "Edited Story" };
    const deleteFiles = ["dfgdfg.png"];

    mockStoriesRepository.save.mockResolvedValueOnce(editedStory);

    expect(await service.editStory({ ...editedStory, deleteFiles }, mockUser, [])).toEqual(editedStory);

    expect(mockFilesService.processFilesUpdate).toHaveBeenLastCalledWith(editedStory.files, deleteFiles, [], MAX_STORY_FILES);
  });

  // deleteStory method
  it("should throw not found exception", () => {
    mockStoriesRepository.findOne.mockResolvedValueOnce(null);

    expect(service.deleteStory(123, mockUser)).rejects.toThrowError(StoriesErrorsEnum.NOT_FOUND_STORY);
  });

  it("should throw forbidden exception (check ownership)", () => {
    expect(service.deleteStory(123, { ...mockUser, id: 2 })).rejects.toThrowError(StoriesErrorsEnum.DONT_HAVE_ACCESS);
  });

  it("should delete story and files", async () => {
    expect(await service.deleteStory(mockStories[0].id, mockUser)).toEqual(true);

    expect(mockFilesService.deleteFiles).toHaveBeenLastCalledWith(mockFiles.split(", "));
    expect(mockStoriesRepository.remove).toHaveBeenLastCalledWith(mockStories[0]);
  });
});
